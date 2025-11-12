# AI Agent Workflow Log

## 🚀 Agents Used
| Agent | Role | Description |
|--------|------|-------------|
| **ChatGPT (GPT-5)** | System Architect / Database Specialist | Helped design database schema, explain Fuel EU CB formula, write backend logic, and structure documentation. |
| **Google Gemini** | Documentation & Refactoring Assistant | Helped draft documentation sections, README summaries, and structure test cases. |
| **GitHub Copilot** | Inline Coding Partner | Generated boilerplate code, Prisma seed data, and assisted in fixing small syntax and typing errors. |
| **Cursor AI Agent** | Code Debugger & Refactorer | Identified TS/React errors, optimized hooks, fixed chart payload bugs, and improved useEffect dependency logic. |
| **Replit Agent** | Rapid Prototyper | Used to scaffold initial hexagonal structure, backend folder organization, and seed setup scripts. |

---

## 🧩 Prompts & Outputs

### Example 1 — ChatGPT (Backend Schema)
**Prompt:**
> “Generate a Prisma schema for maritime routes, banking, and pooling following FuelEU Regulation. Include fields for routeId, vesselType, ghgIntensity, CB values, and seed the sample data.”

**Output Summary:**
ChatGPT generated a detailed Prisma schema with relations for `routes`, `ship_compliance`, `bank_entries`, `pools`, and `pool_members`.  
The schema matched the regulation formula and was compatible with PostgreSQL.

---

### Example 2 — Cursor (Frontend Debugging)
**Prompt:**
> “Fix TypeScript error TS2339: Property 'payload' does not exist on type 'Props<ValueType>' in chart.tsx.”

**Result:**
Cursor suggested adding correct typing for the chart tooltip component (`CustomTooltipProps`) and fixed missing type inference in Recharts props.

---

### Example 3 — GitHub Copilot (Seeding Data)
**Prompt (inline):**
> “Generate a seed script for routes with routeId, vesselType, fuelType, ghgIntensity, and emissions.”

**Output:**
Copilot produced the following:
```ts
await prisma.route.createMany({
  data: [
    { routeId: "R001", vesselType: "Container", fuelType: "HFO", year: 2024, ghgIntensity: 91.0, ... },
    ...
  ]
});
