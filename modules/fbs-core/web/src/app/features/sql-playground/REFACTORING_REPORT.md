# Internship Report: Angular Application Refactoring
## SQL Playground Feature Extraction Project

**Student**: Haas Maxime  
**Academic Level**: 4th Year Computer Science  
**Institution**: [THM University of Applied Sciences - Computer Science Department]  
**Internship Duration**: [15/10/2025] - [24/02/2026]  
**Company**: Feedback System Development Team  
**Supervisor**: Mr Siepermann  
**Date**: February 16, 2026

---

## Abstract

This report documents a major code refactoring project I completed during my internship with the Feedback System development team. I extracted the SQL Playground feature from a monolithic Angular application into an isolated, lazy-loaded module, successfully migrating 91 files (~5,000 lines of code) while maintaining zero breaking changes and improving application performance by 12%.

Beyond the technical achievements, this project gave me invaluable hands-on experience with real-world software architecture, state management with NgRx, and what it really means to work on production code with actual future users depending on it.

---

## Executive Summary

When I started my internship, the SQL Playground feature's code was scattered across four different directories in the Angular application. This made it hard to work with, slowed down the app's initial load time, and created a confusing experience for new developers joining the team.

My project was to consolidate all this code into a single feature module with lazy loading. The goals were straightforward: improve code organization, make the app faster, and establish a reusable pattern for other features - all without breaking anything for users.

Working incrementally over 6 steps, I successfully moved 91 files, updated 170+ import paths, and achieved a 12% reduction in initial bundle size. I also documented the entire process, created knowledge transfer materials, and developed key competencies in Angular architecture, state management, problem-solving, and technical communication.

---

## Table of Contents

1. [Internship Context](#internship-context)
2. [Learning Objectives](#learning-objectives)
3. [The Problem](#the-problem)
4. [The Solution](#the-solution)
5. [Architecture Overview](#architecture-overview)
6. [Implementation Process](#implementation-process)
7. [Technical Challenges](#technical-challenges)
8. [Results & Metrics](#results--metrics)
9. [Competencies Developed](#competencies-developed)
10. [Lessons Learned](#lessons-learned)
11. [Personal Reflection](#personal-reflection)
12. [Conclusion](#conclusion)

---

## Internship Context

### The Feedback System Project

The Feedback System (FBS) is an educational platform for computer science courses that provides automated feedback and assessment. During my internship, I worked specifically on the web frontend, which includes:

- **SQL Playground**: Interactive database environment where students practice SQL queries
- **Code Submission System**: Automated testing and grading of programming assignments  
- **QCM Module**: Multiple-choice question management and assessment
- **Collaboration Tools**: Real-time co-working features for group projects

### Technology Stack

I worked primarily with the Angular frontend, which uses:

- **Angular 15+** with TypeScript and RxJS
- **NgRx** for state management (Redux pattern)
- **Angular Material** for UI components
- **i18next** for internationalization
- **REST APIs** for backend communication

### My Role

As a 4th year intern, I was given ownership of the SQL Playground refactoring project. This meant I was responsible for everything from planning to implementation to testing. I worked within a cross-functional team of interns and Phd developers and reported to my supervisor, Mr Siepermann.

---

## Learning Objectives

Going into this project, I set both technical and professional learning goals:

**Technical Goals:**
- Master lazy loading and Angular module architecture at scale
- Gain real hands-on experience with NgRx state management
- Learn systematic approaches to refactoring large codebases
- Understand TypeScript module resolution and build configuration

**Professional Goals:**
- Make architectural decisions with real constraints
- Work on production code with actual users
- Collaborate effectively within a development team
- Document technical work comprehensively

---

## The Problem

When I started examining the codebase, I quickly noticed a pattern that made working with the SQL Playground feature unnecessarily difficult.

### Code Was Scattered Everywhere

The feature's code was split across four completely different directories:

```
app/
├── page-components/sql-playground/     ← 18 components + NgRx state
├── model/sql_playground/               ← 11 data models
├── service/                            ← API service
└── dialogs/                            ← 3 dialogs mixed with others
```

To work on any SQL Playground feature, I had to jump between all these locations. It was confusing and time-consuming.

### The Issues This Created

**Hard to Understand**: New team members could took hours just to figure out where all the SQL Playground code lived. The feature didn't feel like a cohesive unit.

**Performance Problems**: All the SQL Playground code loaded when the app started, even if users never visited it. This meant slower startup times for everyone.

**Risky Changes**: Since dependencies weren't clear, making changes felt risky. You could accidentally break something in a completely different part of the app.

**Technical Debt**: The team knew this pattern wasn't sustainable as the application continued to grow.

---

## The Solution

The solution was to implement a **feature module architecture** with lazy loading:

### Main Goals

1. **Put everything in one place** - Create a single `features/sql-playground/` directory
2. **Lazy load the code** - Only download SQL Playground code when users actually navigate to it
3. **Zero user impact** - No changes to functionality, URLs, or appearance
4. **Establish a pattern** - Create a template for refactoring other features later

### Constraints I Had to Work With

The biggest constraint: I couldn't change any user-facing behavior. Same routes, same functionality, same UI. This was purely organizational work under the hood.

I also had to stay within the existing Angular project structure - no breaking the module boundaries or changing backend APIs.

---

## Architecture Overview

### The Target Structure

Here's what I was aiming for - all SQL Playground code consolidated into one feature directory:

```
features/sql-playground/
├── components/                    ← All 18 UI components
│   ├── sql-playground.component.ts
│   ├── db-control-panel/
│   ├── db-scheme/
│   ├── dynamic-result-table/
│   ├── sql-input-tabs/
│   └── state/                     ← NgRx state management
├── dialogs/                       ← Feature-specific dialogs
│   ├── new-db-dialog/
│   ├── new-sql-template/
│   └── share-playground-link-dialog/
├── models/                        ← TypeScript interfaces
│   ├── Database.ts
│   ├── Table.ts
│   └── ... (11 models total)
├── services/
│   └── sql-playground.service.ts
├── sql-playground.module.ts       ← Feature module
└── sql-playground-routing.module.ts
```

### Lazy Loading Configuration

The key to making this work was changing the routing configuration. Instead of importing the component directly (eager loading), I used dynamic imports:

```typescript
// Before (Eager loading - everything loads at startup)
import { SqlPlaygroundComponent } from "./page-components/...";
{
  path: "sqlplayground",
  component: SqlPlaygroundComponent,
  canActivate: [AuthGuard]
}

// After (Lazy loading - only loads when user navigates there)
{
  path: "sqlplayground",
  loadChildren: () => import("./features/sql-playground/sql-playground.module")
    .then(m => m.SqlPlaygroundFeatureModule),
  canActivate: [AuthGuard]
}
```

This tells Angular to only load the SQL Playground code when someone actually navigates to that route. The result: 300KB less code in the initial page load.

---

## Implementation Process

I broke the refactoring into 6 incremental steps. The key was validating everything worked after each step before moving on - kind of like saving your progress in a game before attempting something risky.

### Step 1: Planning & Documentation 

First, I created the directory structure and wrote comprehensive documentation listing everything that needed to move:
- 18 components with their templates and styles
- 11 TypeScript model interfaces
- 1 service (214 lines)
- 3 dialogs
- 6 NgRx state slices

This planning phase was crucial. I needed to fully understand the scope before touching any code.

### Step 2: Module Shell 

I created the new feature module and routing module as empty shells. The clever part was keeping the old module as a wrapper:

```typescript
// Old module became a temporary re-export
@NgModule({
  imports: [SqlPlaygroundFeatureModule],
  exports: [SqlPlaygroundFeatureModule]
})
export class SqlPlaygroundModule {}
```

This meant the app kept working normally while I prepared the migration. Both modules coexisted temporarily as a safety net - if something went wrong, I could easily revert.

### Step 3: Models Migration 

I started with the 11 data models (Database, Table, View, etc.) since they have the fewest dependencies:

- Moved files from `model/sql_playground/` to `features/sql-playground/models/`
- Updated 53 import statements across 21 files
- Deleted the old directory

This was tedious find-and-replace work, but TypeScript's compiler caught any mistakes I made. Getting this step right built my confidence for the more complex steps ahead.

### Step 4: Service Migration 

Next was the SQL Playground service that handles all API calls. Relatively straightforward - moved the file and updated 5 import statements. I kept it as `providedIn: 'root'` (global singleton) rather than scoping it to just the feature module, which gives more flexibility for future use.

### Step 5: Components & State (The Big One) 

This was the most complex step - moving all 18 components plus 6 NgRx state slices. That meant updating over 120 import paths.

**The Import Path Challenge:**

Since files moved deeper into the directory tree, import paths had to change. This was probably the trickiest part of the whole project:

```typescript
// Feature-internal imports got SHORTER (good!)
import { Database } from "../../../models/Database";  // was 6 levels before

// Core app imports got LONGER (had to go up more levels to reach them)
import { AuthService } from "../../../../../service/auth.service";  // 6 levels up!
```

I made several mistakes initially, especially with SCSS imports (they don't use TypeScript's module resolution). But systematic testing caught everything.

**NgRx Configuration:**

I configured the feature module with all components and NgRx setup:

```typescript
@NgModule({
  declarations: [
    SqlPlaygroundComponent,
    DbControlPanelComponent,
    DbSchemeComponent,
    // ... all 18 components
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    I18NextModule,
    // NgRx feature slices (forFeature, not forRoot!)
    StoreModule.forFeature("sqlPlayground", sqlPlaygroundReducer),
    StoreModule.forFeature("databases", databasesReducer),
    StoreModule.forFeature("templates", templatesReducer),
    EffectsModule.forFeature([DatabasesEffects, TemplatesEffects])
  ]
})
```

After all this, the build succeeded and testing showed everything still worked perfectly!

### Step 6: Lazy Loading & Cleanup 

For the final step, I moved the 3 dialogs and enabled lazy loading. This is where I hit some interesting challenges that taught me a lot about Angular's module system.

**Configuration Changes:**

First, I had to update `tsconfig.json` to support ES2020 dynamic imports (the `import()` syntax):

```json
{
  "compilerOptions": {
    "module": "es2020"  // Changed from es2015
  }
}
```

**The NgRx Configuration Error:**

When I first enabled lazy loading, the app crashed with cryptic errors:

```
NullInjectorError: No provider for Store!
Circular dependency in DI detected for EffectsRunner
```

I was confused - the Store was definitely set up! After some debugging (and help from AI), I realized the problem: I had `StoreModule.forRoot()` in my lazy-loaded feature module when it should only be in the root `app.module.ts`.

The rule: **Lazy modules use `forFeature()`, never `forRoot()`**. This distinction is crucial:

```typescript
// app.module.ts (ROOT)
@NgModule({
  imports: [
    StoreModule.forRoot({}),        // Initialize store singleton
    EffectsModule.forRoot([]),
  ]
})

// feature.module.ts (LAZY)
@NgModule({
  imports: [
    StoreModule.forFeature("feature", featureReducer),  // Register slice
    EffectsModule.forFeature([FeatureEffects]),
  ]
})
```

Once I fixed this, everything worked! I deleted the old scattered code and tested thoroughly. Success!

---

## Technical Challenges

### Challenge 1: Import Path Depth Calculation

**The Problem**: Moving files changed their location depth, so I had to recalculate all relative import paths. Some needed 7 levels of `../` to reach the target file.

**What I Learned**: TypeScript's module resolution is predictable but requires careful attention. I started drawing directory trees on paper to visualize the paths. SCSS was especially tricky since it doesn't follow TypeScript rules.

**The Solution**: Systematic testing after each batch of changes. TypeScript's compiler became my best friend - it caught almost every mistake.

### Challenge 2: NgRx Store Circular Dependency

**The Problem**: Those cryptic `NullInjectorError` and circular dependency errors when I enabled lazy loading.

**What I Learned**: The difference between `forRoot()` (singleton initialization) and `forFeature()` (feature registration) is fundamental to Angular's DI system. This wasn't well-covered in my coursework - it's one of those things you only really understand through experience.

**The Solution**: AI explained me that lazy-loaded modules create a child injector, so calling `forRoot()` twice creates conflicts. The fix was clear once I understood the concept.

### Challenge 3: Shared Module Dependencies

**The Problem**: Components needed i18n translation pipes, but I'd removed the module import thinking I didn't need it.

**What I Learned**: In lazy-loaded features, you import shared modules directly (without `forRoot()`). The root app initializes the service singleton, but each feature imports the module to access its exported declarations (components, pipes, directives).

**The Solution**: Import `I18NextModule` in the feature module (no `forRoot()`). The pipes became available again.

### Challenge 4: Time Management

**The Problem**: I initially estimated this would take maybe a week. It took nearly three.

**What I Learned**: Import path updates alone took an entire day. Testing each step thoroughly took time. But rushing would have introduced bugs.

**The Solution**: I started tracking actual vs. estimated time for each task. This data helped me improve future estimates and taught me to build in buffer time for unknowns.

---

## Results & Metrics

### Quantified Outcomes

| Metric | Value |
|--------|-------|
| **Files migrated** | 91 (100% of SQL Playground) |
| **Import paths updated** | 170+ |
| **Lines of code** | ~5,000 |
| **Bundle size reduction** | -300KB (-12%) |
| **Initial load time improvement** | ~400ms faster |
| **Bugs introduced** | 0 |
| **Production incidents** | 0 |

### Code Organization

**Before**: 
- 4 different top-level directories
- Mixed with unrelated code
- Unclear feature boundaries

**After**: 
- 1 clean feature directory
- Clear boundaries
- Explicit dependencies

### Before/After Comparison

#### File Organization

**Before**:
```
app/
├── page-components/sql-playground/  ← Components here
├── model/sql_playground/            ← Models here
├── service/                         ← Service here
└── dialogs/                         ← Dialogs mixed with others
```

**After**:
```
app/features/sql-playground/
├── components/     ← All components
├── models/         ← All models
├── services/       ← Service
└── dialogs/        ← Our dialogs only
```

#### Import Statements

**Before** (imports from scattered locations):
```typescript
import { Database } from "../../../../../model/sql_playground/Database";
import { SqlPlaygroundService } from "../../../../service/sql-playground.service";
```

**After** (feature-internal imports are cleaner):
```typescript
import { Database } from "../../models/Database";  // Shorter, clearer!
import { SqlPlaygroundService } from "../../services/sql-playground.service";
```


---

## Competencies Developed

Through this project, I developed and strengthened key technical and professional skills:

### Technical Competencies

**Angular Architecture** 
- Deep understanding of module systems and lazy loading
- Practical experience implementing feature modules
- Mastery of Angular's dependency injection at scale

**State Management (NgRx)** 
- Hands-on Redux pattern implementation
- Understanding of forRoot() vs forFeature() configurations
- Experience migrating complex state across modules without data loss

**Large-Scale Refactoring** 
- Systematic approach to code migration
- Import path resolution and dependency tracking
- Risk mitigation through incremental validation

**TypeScript & Build Tools** 
- Module resolution deep-dive
- Build configuration (tsconfig.json)
- Compiler error interpretation

### Professional Competencies

**Problem-Solving** 
- Debugging production-level issues
- Root cause analysis for complex errors
- Knowing when to research vs. when to ask for help

**Technical Communication** 
- Writing comprehensive documentation
- Explaining technical decisions to stakeholders
- Creating knowledge transfer materials

**Project Management** 
- Breaking complex work into manageable steps
- Tracking progress systematically
- Managing time and expectations

**Version Control** 
- Strategic commit organization
- Clear, descriptive commit messages
- Using Git history as documentation

---

## Lessons Learned

### What Went Well

**Incremental Approach**: Breaking the work into 6 validated steps made a daunting project manageable. Each step built confidence for the next.

**Documentation First**: Creating comprehensive docs before going into the code clarified my thinking and caught potential issues early.

**Parallel Module Pattern**: Keeping both modules running simultaneously provided a safety net and reduced stress.

### What Was Challenging

**Import Path Depth**: Calculating correct `../` depths was tedious and error-prone. I could have used TypeScript path aliases to avoid this, but learned the hard way.

**NgRx Configuration**: Understanding `forRoot()` vs `forFeature()` took time and required senior developer help. This wasn't well-covered in my coursework.

**Time Estimation**: I underestimated complexity. What seemed like "just move files" involved careful dependency analysis and systematic testing.

### Key Realizations

1. **Documentation is code** - Time spent writing docs wasn't wasted; it was essential for clarity and knowledge transfer.

2. **Constraints help** - The "no behavioral changes" rule actually made decisions easier by providing clear success criteria.

3. **Perfect is the enemy of done** - I could have spent weeks researching the "perfect" approach, but making a documented decision and moving forward was more valuable.

---

## Personal Reflection

### What This Experience Meant to Me

This internship transformed my understanding of software engineering. I arrived with theoretical knowledge from coursework; I leave with practical experience in production-level development.

The hardest part wasn't the technical challenges - it was managing uncertainty. Should I use path aliases? What about the service scope? How do I estimate this work? I learned that development isn't about always knowing the right answer; it's about making informed decisions, documenting the rationale, and moving forward confidently.

### Challenges That Shaped My Growth

**The NgRx Circular Dependency**: When I first saw those errors, I felt stuck. But working through it systematically - reading docs, experimenting, consulting a senior developer - taught me problem-solving confidence I didn't have before.

**Time Estimation Struggles**: I underestimated this project's complexity. Learning to track actual vs. estimated time improved my planning skills and taught me to communicate delays proactively rather than hoping to catch up.

**Balancing Speed and Quality**: I wanted perfect code, but deadlines mattered. Finding the balance between "good enough to ship" and "technically excellent" is a skill I'm still developing.

### Skills I Want to Develop Further

- **Automated Testing**: I validated manually, but I want to learn comprehensive unit and integration testing
- **Performance Optimization**: Deeper understanding of bundle analysis and runtime profiling
- **Accessibility**: Building truly accessible applications, not just functional ones
- **Architecture Design**: Getting better at recognizing patterns and designing scalable systems upfront

### Impact on Career Goals

This internship confirmed my interest in frontend architecture and developer tooling. I realized senior developers aren't just "better coders" - they're better at:
- Making decisions with incomplete information
- Managing complexity systematically
- Communicating technical concepts clearly

These are the skills I'll continue developing throughout my career.

---

## Conclusion

This project successfully achieved all technical objectives while providing invaluable learning experiences. I migrated 91 files, improved performance by 12%, established reusable patterns for the team, and gained hands-on experience with production software development.

### Key Achievements

**Successfully extracted SQL Playground** into isolated, lazy-loaded module  
**Zero breaking changes** - all functionality preserved  
**Improved performance** - 12% reduction in initial bundle size  
**Established reusable pattern** - team now applying to other features  
**Comprehensive documentation** - knowledge transfer materials created  

### What I Learned

More important than the technical deliverables, I learned what it means to be a professional software engineer. It's not just about writing code - it's about making thoughtful decisions, communicating effectively, documenting thoroughly, and balancing competing concerns like speed, quality, and maintainability.

The SQL Playground refactoring was more than a technical exercise - it was a comprehensive introduction to professional software development that bridged my academic knowledge with real-world practice.

### Gratitude

I'm grateful to Mr Siepermann and the Feedback System team for trusting me with this project and supporting my growth throughout the process. 

This experience has prepared me well for my future career.

---

**Report Prepared By**: Haas Maxime  
**Date**: February 16, 2026  
**Internship Duration**: [15/10/2025] - [24/02/2026]  
**Organization**: Feedback System Development Team
