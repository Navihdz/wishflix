# Team Onboarding and Wishlist Merge Design

**Date:** 2026-02-27

## Goal

Enable user self-registration, optional team join/create onboarding, and later team joining with merge support while keeping the app fully usable in solo mode.

## Decisions

- New users always get a personal team (space) automatically.
- Onboarding options after registration: create team, join by code, continue solo.
- Team actions are also available later from settings.
- Joining another team can trigger optional merge from the current active team.
- Merge deduplicates items by `(type, source, externalId)`.
- Merge conflict rule: item status always becomes `wishlist`.
- Duplicate authorship is preserved and displayed as multiple contributors.
- Session remains persistent so returning users land directly in `/inicio`.

## Data Model

- `User.activeSpaceId` to track current team context.
- `Space.joinCode` unique short code for joining.
- New `ItemContributor` table to support multiple users as contributors for one item.
- Keep `Item.addedById` for backward compatibility and legacy displays.

## API Surface

- `POST /api/auth/register`
- `GET /api/auth/session`
- `GET /api/spaces/me`
- `POST /api/spaces/create`
- `POST /api/spaces/join`
- `POST /api/spaces/switch-active`

## UX Flow

- Login page includes register mode.
- Post-register onboarding asks create/join/skip.
- Settings page allows create/join/switch and shows active team join code.
- Wishlist row displays one or multiple contributor names.

## Safety / Compatibility

- Existing users with memberships are backfilled to `activeSpaceId`.
- Existing items get one contributor row from `addedById`.
- `getCurrentUserContext` uses `activeSpaceId` with fallback to first membership.

