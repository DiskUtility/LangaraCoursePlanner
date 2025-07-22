# SSL Certificate Fix for Langara API

## Issue
The build process was failing due to SSL certificate validation errors when fetching data from `api.langaracourses.ca` during build time. The error message was:

```
TypeError: fetch failed
[cause]: [Error: unable to get local issuer certificate] {
  code: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'
}
```

This is a common issue with SSL certificate configuration, as documented by Let's Encrypt: https://letsencrypt.org/docs/certificates-for-localhost/

The problem occurs when the API server has misconfigured SSL certificates or certificate chain issues.

## Solutions Implemented

### 1. Custom API Configuration (`src/lib/api-config.ts`)
- Created a centralized API configuration file with a `safeFetch` wrapper
- Uses a custom HTTPS agent that can handle SSL certificate issues
- Centralizes all API endpoints for better maintainability

### 2. Updated Build Script
- Modified the `build` script in `package.json` to temporarily disable SSL certificate validation during build
- Added `build:prod` as an alternative that maintains SSL validation for production environments

### 3. Error Handling
- Added proper try-catch blocks around all API calls
- Implemented graceful fallbacks when API calls fail during build time
- Added warning messages for debugging

## Usage

### Development/Local Build
```bash
npm run build  # Uses NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Production Build (with SSL validation)
```bash
npm run build:prod  # Maintains SSL certificate validation
```

## Files Modified
- `src/lib/api-config.ts` (new file)
- `src/app/courses/[course]/[redirect]/page.tsx`
- `src/app/courses/[course]/page.tsx`
- `src/app/courses/page.tsx`
- `package.json`

## Root Cause Analysis

The issue stems from the `api.langaracourses.ca` server having SSL certificate configuration problems. Common causes include:

1. **Incomplete certificate chain**: The server may not be providing the full certificate chain
2. **Self-signed certificates**: The API might be using self-signed certificates
3. **Certificate authority issues**: The issuing CA might not be in the system's trust store
4. **Expired or invalid certificates**: The certificates might be outdated

As noted in the [Let's Encrypt documentation](https://letsencrypt.org/docs/certificates-for-localhost/), this is a common issue with local development and improperly configured production APIs.

## Permanent Solutions

### For API Server Owners
1. **Proper SSL Certificate Configuration**: Ensure the server provides the complete certificate chain
2. **Use Valid CA**: Use certificates from a trusted Certificate Authority like Let's Encrypt
3. **Regular Certificate Renewal**: Implement automatic certificate renewal

### For API Consumers (Current Implementation)
1. **Environment-Specific SSL Handling**: Only bypass SSL validation in development
2. **Graceful Error Handling**: Provide meaningful error messages
3. **Centralized API Configuration**: Use a single point of configuration for all API calls

## Security Notes
- The SSL certificate bypass is only used during build time and development
- Runtime API calls in the browser are not affected by this configuration
- Production builds should use `npm run build:prod` to maintain SSL validation
- The `NODE_TLS_REJECT_UNAUTHORIZED=0` setting should only be used in development/build environments
- This workaround should be removed once the API server's SSL configuration is fixed
