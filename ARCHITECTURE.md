# Architecture Overview – Ai4Safety

## 1. System Overview
Ai4Safety is a multi-tenant SaaS for building inspection using drone imagery.
Core workflow:
Images → AI processing → Defects → Review → Analytics

## 2. High-Level Components
- Frontend (Next.js): UI, annotation, 3D/GS viewer
- Backend (FastAPI): API, auth, domain logic
- Processing Workers: AI inference, precomputation
- Storage: Images, splats, derived artifacts
- Database: Canonical inspection data

## 3. Data Flow (Critical)
1. User uploads images
2. Images stored in object storage
3. Async job triggers AI pipeline
4. AI outputs defects + metadata
5. Results stored as derived data
6. Frontend consumes precomputed results

## 4. Sync vs Async
- Sync: auth, CRUD, annotations
- Async: AI inference, analytics, model generation

## 5. Performance Strategy
- Heavy computations are precomputed
- Dashboard queries are read-only
- No AI inference in request/response path

## 6. Security & Tenancy
- All domain entities scoped by tenant_id
- No cross-tenant reads
