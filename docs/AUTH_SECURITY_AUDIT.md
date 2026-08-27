# Sejel — Authentication & Security Audit

> **Date:** 2026-08-27  
> **Status:** Audit Complete  
> **Auditor:** Code review (automated)

---

## 1. Token Storage Location

**Current behavior:** Both access and refresh tokens are stored in `localStorage`.

| Token | Storage | File |
|-------|---------|------|
| Access token | `localStorage.setItem('access_token', data.access)` | `frontend/src/stores/auth.js:21` |
| Refresh token | `localStorage.setItem('refresh_token', data.refresh)` | `frontend/src/stores/auth.js:22` |

**Risk level:** HIGH  
**XSS exposure:** Any JavaScript running on the page can read `localStorage` and exfiltrate tokens.  
**Pilot assessment:** Acceptable for a trusted internal network (station operators on same LAN). NOT acceptable for public internet.  
**Recommended fix (post-pilot):** Migrate to HttpOnly + Secure + SameSite cookies. This requires backend changes to set cookies on login/refresh instead of returning tokens in JSON body.

---

## 2. Token Injection (Request Interceptor)

**Current behavior:** Axios request interceptor reads token from `localStorage` and sets `Authorization: Bearer <token>` header.

```javascript
// frontend/src/api.js:9-12
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**Risk level:** LOW (standard pattern)  
**Notes:** This is the standard JWT header injection pattern. No issues.

---

## 3. Auto-Refresh on 401

**Current behavior:** When a request returns 401, the interceptor attempts to refresh the access token using the stored refresh token.

```javascript
// frontend/src/api.js:16-41
// On 401:
// 1. Read refresh_token from localStorage
// 2. POST to /api/auth/refresh/
// 3. Store new access_token (and new refresh_token if rotated)
// 4. Retry original request with new token
// 5. On failure: clear tokens, redirect to /login/
```

**Risk level:** MEDIUM  
**Issues:**
- No retry limit — if refresh endpoint is down, could loop
- `originalRequest._retry` flag prevents infinite loop, but only for one retry
- Race condition: if multiple requests fail simultaneously, multiple refresh calls fire

**Recommended fix (post-pilot):** Add a refresh mutex (queue pending refresh calls, only fire one).

---

## 4. Access Token Expiry

**Current behavior:** Access token lifetime is 12 hours.

```python
# settings.py:78-83
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

**On expiry:** Next API call returns 401 → interceptor refreshes → retries request. User sees no interruption.

**Risk level:** LOW  
**Notes:** 12-hour access token is reasonable for a shift-based system (max shift is 8 hours).

---

## 5. Refresh Token Expiry

**Current behavior:** Refresh token lifetime is 7 days.

**On expiry:** Interceptor's refresh call fails → tokens are cleared → `window.location.href = '/login/'` forces re-login.

**Risk level:** LOW  
**Notes:** 7-day refresh token is reasonable. Operators re-login weekly at most.

---

## 6. Logout Flow

**Current behavior:** Logout clears `localStorage` only. No server-side token revocation.

```javascript
// frontend/src/stores/auth.js:39-43
logout() {
  this.user = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}
```

**Risk level:** MEDIUM  
**Issues:**
- JWT remains valid until expiry after logout
- If an attacker has a copy of the token, they can use it for up to 12 hours
- No server-side token blacklist

**Recommended fix (post-pilot):** Implement token blacklist (Redis or DB) for high-security deployments. For pilot, document that logout is client-side only.

---

## 7. Concurrent Sessions

**Current behavior:** Same user can be logged in on multiple devices simultaneously. Each device gets its own JWT pair.

**Risk level:** LOW  
**Notes:** This is acceptable for a station management system. Operators may use both desktop and tablet.

---

## 8. Password Change

**Current behavior:** No password change endpoint exists in the Vue SPA. Password changes must be done through Django admin or legacy template views.

**Risk level:** LOW  
**Notes:** Password management is an admin function, not a daily operator task.

---

## 9. User Disable

**Current behavior:** Disabling a user in Django admin sets `is_active=False`. However, JWT tokens remain valid until expiry because SimpleJWT validates `is_active` on token creation only, not on each request.

**Risk level:** MEDIUM  
**Issues:**
- Disabled user's existing JWT continues to work for up to 12 hours
- No mechanism to immediately revoke all tokens for a disabled user

**Recommended fix (post-pilot):** Either: (a) check `is_active` on each request via a custom authentication class, or (b) implement token blacklist.

---

## 10. CSRF Posture

**Current behavior:** Two auth mechanisms coexist:

| Auth Method | CSRF Protection | Used By |
|-------------|----------------|---------|
| Django Session | Enforced (Django middleware) | Legacy template views at `/` |
| JWT (SimpleJWT) | Not enforced (by design) | Vue SPA at `/app/` and API at `/api/` |

```python
# settings.py:57-58
'REST_FRAMEWORK': {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
}
```

**Risk level:** LOW  
**Notes:** JWT bypasses CSRF by design (uses `Authorization` header, not cookies). Session auth has CSRF protection. This is correct behavior.

---

## 11. Route Guard

**Current behavior:** Router guard checks token presence only, not validity.

```javascript
// frontend/src/router/index.js:103-110
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (!to.meta.public && !token) {
    next('/app/login/')
  } else {
    next()
  }
})
```

**Risk level:** LOW  
**Issues:**
- Expired/garbage token passes guard → fails at first API call → 401 → redirect to login
- Minor UX issue: user sees a flash of the protected page before redirect

**Recommended fix (post-pilot):** Decode JWT client-side and check expiry before allowing navigation.

---

## 12. Dual Auth Coexistence

**Current behavior:** Session auth (legacy) and JWT (SPA) run simultaneously.

| Aspect | Session Auth | JWT Auth |
|--------|-------------|----------|
| Login | Django `LoginView` | `/api/auth/login/` |
| Logout | Django `LogoutView` (destroys session) | Client-side `localStorage` clear |
| Token storage | Session cookie (HttpOnly) | `localStorage` |
| CSRF | Enforced | Not enforced |

**Risk level:** MEDIUM  
**Issues:**
- Legacy logout (`/logout/`) destroys Django session but NOT the JWT
- SPA logout clears `localStorage` but NOT the Django session cookie
- User could be "half-logged-out" in one auth system while still active in the other

**Recommended fix (post-pilot):** After SPA migration is complete, deprecate legacy template views and remove session auth.

---

## Summary

| # | Item | Risk | Blocks Pilot? |
|---|------|------|:-------------:|
| 1 | JWT in localStorage | HIGH | No (internal network) |
| 2 | Token injection | LOW | No |
| 3 | Auto-refresh | MEDIUM | No |
| 4 | Access token expiry (12h) | LOW | No |
| 5 | Refresh token expiry (7d) | LOW | No |
| 6 | Logout (no server revocation) | MEDIUM | No |
| 7 | Concurrent sessions | LOW | No |
| 8 | No password change endpoint | LOW | No |
| 9 | Disabled user JWT persists | MEDIUM | No |
| 10 | CSRF posture | LOW | No |
| 11 | Route guard (presence only) | LOW | No |
| 12 | Dual auth coexistence | MEDIUM | No |

**Overall assessment:** No pilot-blocking issues found. All medium/high risks are acceptable for a trusted internal network pilot. Document for post-pilot hardening.

---

## Post-Pilot Hardening Backlog

1. Migrate JWT storage from `localStorage` to HttpOnly cookies
2. Add refresh mutex to prevent concurrent refresh calls
3. Implement server-side token blacklist or `is_active` check on each request
4. Add password change endpoint to SPA
5. Deprecate legacy template views after full SPA migration
6. Add route guard JWT expiry validation
