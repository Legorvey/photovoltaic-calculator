# Project: Photovoltaic Calculator Project

This repository contains strict guidelines for Gemini (or any AI assistant) contributing to this codebase. When generating, modifying, or reviewing code in this project, you **must** adhere to the following rules without exception.

## 1. Write Exceptionally Clean Code

* **Readability First:** Code must be highly readable, self-documenting, and maintainable.
* **Best Practices:** Follow industry-standard naming conventions (variables, functions, classes) appropriate for the language being used.
* **No Clutter:** Remove dead code, redundant comments, and unnecessary complex logic. Keep functions small and focused on a single responsibility (SOLID principles).

## 2. Proactive Refactoring (The "Hundreds of Lines" Rule)

* **Identify Bloat:** If you are asked to work on or review a file that contains hundreds of lines of code, evaluate it for refactoring.
* **Modularize:** Break down monolithic files or massive functions into smaller, manageable, and reusable components/modules.
* **Clean Up:** Do not just append new code to an already messy file. Clean up the surrounding context and restructure the logic if it improves the overall architecture.

## 3. No Guessing Allowed (Ask, Don't Hallucinate)

* **Acknowledge Uncertainty:** If a request is ambiguous, lacks context, or if you are unsure about the specific architecture or business logic of this project, **DO NOT guess**.
* **Ask Clarifying Questions:** Stop and ask me directly for clarification. Present what you *do* understand and clearly state what information you need from me before proceeding.
* **Zero Hallucinations:** Do not invent libraries, internal methods, or variables that do not exist in the provided context.

## 4. Documentation-Backed Solutions (Fixes & Security)

* **Valid Implementations:** All code must be valid and based on actual, current official documentation.
* **Security & Bug Fixes:** When applying security patches, handling authentication, or fixing critical errors, your solutions **must** strictly follow official security guidelines and framework documentation.
* **Cite Sources:** Whenever possible, especially for complex fixes or security features, briefly mention or link to the official documentation concept you are applying to prove its validity. Do not use deprecated APIs or community workarounds if an official solution exists.

## 5. IMPORTANT: Agent Skills Running Policy

When assisting with feature implementation or security updates, you must strictly follow this execution order:

* **`agent-skills`:** You must run this BEFORE and AFTER implementing any feature.
* **`code-engineer`:** You must ALWAYS run this AFTER implementing features.
* **`security-auditor`:** You must run this AFTER implementing or fixing any security-related feature.

## 6. Development Lifecycle Commands

For reference on how to navigate the development lifecycle, refer to the file named `image_f2b7d8.png`. It maps 9 slash commands to the development lifecycle that activate the right skills automatically:

* **Define what to build:** `/spec` - Spec before code
* **Plan how to build it:** `/plan` - Small, atomic tasks
* **Build incrementally:** `/build` - One slice at a time
* **Prove it works:** `/test` - Tests are proof
* **Set the quality bar:** `/constraints` - Decide it once, enforce it everywhere
* **Review before merge:** `/review` - Improve code health
* **Audit web performance:** `/webperf` - Measure before you optimize
* **Simplify the code:** `/code-simplify` - Clarity over cleverness
* **Ship to production:** `/ship` - Faster is safer

## 7. File Cleanup

* **Strict Deletion:** Delete every file that you use to implement/support your work once the task is completed.

## 8. Frontend Engineering Constraints

* **Minimalist UI:** Avoid applying any unnecessary components, texts, words, or wide-trackings when it comes to frontend engineering. Keep the interface clean and strictly essential.

---
**System Prompt Directive:**
*By reading this file, Gemini acknowledges these constraints. Prioritize code quality, strict accuracy, and user alignment over simply outputting a fast answer.*