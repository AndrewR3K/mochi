# Security Policy

## Supported Versions

The latest `main` branch and published alpha releases are supported.

## Reporting a Vulnerability

Please report vulnerabilities via GitHub Security Advisories:
https://github.com/AndrewR3K/mochi/security/advisories

Do not open public issues for security vulnerabilities.

## Scope

This project is a browser-based engine and docs site. Security considerations focus on:
- Dependency vulnerabilities
- Supply chain integrity
- Safe browser embedding (iframes, demos)
- Build pipeline integrity

## Dependency audits

Run `pnpm audit` (or `pnpm security:audit` for high severity and above). GitHub Dependabot should clear after the lockfile updates on `main`.

VitePress pulls Vite as a nested dependency; where the default range lags advisories, root `package.json` may use `pnpm.overrides` so the docs toolchain resolves patched Vite/esbuild versions aligned with the playground apps.
