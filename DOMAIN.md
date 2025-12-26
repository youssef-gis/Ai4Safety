# Domain Model – Ai4Safety

## Core Entities

### Tenant
Represents a company.
All data is tenant-scoped.

### Inspection
A logical inspection session.
Owns images, defects, annotations.

### Image
Raw uploaded drone image.
Source of truth for visual inspection.

### Defect
A detected or manually created issue.
Always references at least one Image.

### Annotation
User-created markup on an image.
Can be linked to a Defect.

## Source of Truth Rules
- Images are immutable
- Defects are derived data
- 3D models are visualization artifacts
- Analytics are precomputed and disposable

## Important Constraints
- Same defect may appear in multiple images
- Annotations do NOT duplicate across images
- Defects unify multiple image observations
