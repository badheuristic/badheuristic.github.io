---
title: "building city mind"
date: 2026-03-25T11:38:00
description: "a description of the solution i built during the FCI x LangChain hackathon"
tags: [ project, hackathon, ai ]
---

 Last Sunday, my team and I participated in the Future Cities Institute x LangChain hackathon at the University of Waterloo. We had 6 hours to build a solution for a municipal data fragmentation problem that has affected Waterloo Region, and plenty of other cities, for a long
  time. We built CityMind, a governed data gateway for municipal governments that helps departments share data across silos without giving up control over access. This post is about how we built it and what we learned, but first, the problem.

  # the problem

  The prompt was roughly: "Design the secure data nervous system that lets planning, transit, engineering, and health finally think as one city."

  Our first instinct was to treat that as a plumbing problem. Departments have data, the data is scattered, so the goal must be to connect the pipes. Our first two approaches went in that direction: query public city websites, aggregate whatever we could find, and present it
  through a single interface.

  That was the wrong framing.

  The deeper problem is not just fragmentation. It is trust. Departments do not want to hand over raw data if that means losing control over who can see it, how it can be joined with other data, or whether access is being monitored. Without shared rules about access, every
  integration attempt becomes a political negotiation. Without auditability, there is no real accountability. And without those two things, there is very little incentive to share data efficiently.

  A concrete example is Waterloo Region pausing some development approvals over water supply concerns. Planning decisions depend on infrastructure constraints, but those dependencies are hard to manage when information is spread across organizational boundaries.<sup><a href="#ref-
  1" id="ref-1-back">[1]</a></sup>

  # the design

  CityMind is built around governance, not just connectivity.

  The core idea is simple:

  1. Datasets are registered in a shared catalog.
  2. Queries go through a gateway rather than directly to the data source.
  3. The gateway applies role-based privacy rules before returning anything.
  4. Every query is written to an audit log.

  That was the architectural center of the project. The point was not to build "one more dashboard." The point was to make data sharing legible and enforceable.

  In the version we built at the hackathon, the live system uses a governed local replica of open municipal datasets and applies privacy rules at the API layer. Conceptually, it reflects a federated model: departments keep ownership over their systems, while CityMind acts as the
  governed access layer between data and consumers.

  # the architecture

  The stack has four layers: a custom React frontend, a LangGraph-based AI agent running Claude Sonnet, a FastAPI gateway where privacy and access rules are enforced, and a local SQLite replica containing the datasets we worked with.

  ```mermaid
  %%{init: {'themeVariables': { 'fontFamily': 'DejaVu Math TeX Gyre', 'fontSize': '16px' } } }%%
  flowchart TD
      UI["React Web UI\nDashboard · Map · Audit · Chat"]
      AI["AI Agent\nLangGraph + Claude Sonnet"]
      GW["FastAPI Gateway\n/query · /catalog · /audit"]
      PL["RBAC Privacy Layer\napply_privacy()"]
      DB[("SQLite Replica\nplanning · engineering · transit tables")]

      UI --> AI --> GW --> PL --> DB
  ```

  The frontend is a custom React app built with Vite and React Router. It includes governance views like a data quality dashboard, a shared data dictionary, and an audit log, along with data-oriented views like a dataset explorer, cross-department analysis page, citizen portal,
  map view, and sync status page. There is also a floating chat widget that sends natural-language questions to the backend and renders responses inline.

  One important design choice was that governance was not limited to the chat interface. The project’s backend applies the same privacy logic to structured query flows, and the AI assistant is just another client of that governed backend.

  We also synced in real open data from the City of Kitchener, the City of Waterloo, and the Region of Waterloo through ArcGIS-backed sources. In the repo version, that replica includes building permits, water mains, and bus stops, and the sync pipeline is designed to be
  rerunnable without duplicating records.

  # the privacy layer

  This was the part that mattered most.

  A lot of systems handle privacy procedurally: write a policy, warn users not to access the wrong fields, and hope everyone behaves correctly. We wanted privacy to be enforced structurally instead.

  In CityMind, the gateway runs apply_privacy() before data leaves the backend. Access depends on both the requester’s role and the dataset they are querying. In the implemented version, planners get full access to planning data, aggregated views of engineering data, and read
  access to transit. Analysts get read access to planning and transit, but only anonymized engineering data. Admin gets full access across the supported departments.

  We also implemented small-cell suppression. If a query would return fewer than five records, the system can withhold the result and mark it as suppressed. That matters because narrow filters can sometimes expose sensitive information indirectly, even when fields have already
  been stripped.

  Every query writes an audit entry with the requester’s role, department, filter description, access level applied, record count, and whether suppression occurred. That gave us a governance story that felt much stronger than "ask the AI and trust it."

  # what it looks like in practice

  A representative interaction might look like this:

  A user asks a planning-oriented question in natural language. The agent uses the catalog tool to identify relevant datasets, then calls backend query tools with the appropriate role. The backend returns structured results after privacy filtering, and the agent synthesizes them
  into a readable answer. The system prompt also requires the agent to retrieve recent audit information as part of the workflow, so governance stays visible instead of disappearing behind the chatbot interface.

  That is the key pattern: natural language in, governed structured data out.

  The AI is not directly "figuring out the city." It is acting as an interface over explicit backend tools and policy-constrained data access.

  # what those six hours taught us

  The code was not the hardest part. The hardest part was realizing we were solving the wrong problem at first.

  Our early versions assumed the challenge was mainly about integrating data sources. Once we understood that the real issue was trust, the architecture became much clearer. You need a catalog so people know what exists. You need enforced access control so departments feel safe
  participating. You need auditability so the whole arrangement is politically defensible. Once those pieces are in place, the rest of the product starts to make sense.

  The tech stack itself was straightforward: Python, FastAPI, SQLite, LangGraph, Claude, and React. What made the project interesting was one constraint we kept coming back to: the assistant should not have special privileges, and governance should not be optional. The AI layer
  had to sit on top of the same backend rules as everything else.

  That was the most useful lesson from the hackathon. If you are building shared civic infrastructure, the system cannot just be convenient. It has to be governable.
  <br>

  # references
  <ol class="references">
      <li id="ref-1">CBC News. <a href="https://www.cbc.ca/news/canada/kitchener-waterloo/region-waterloo-water-capacity-quantity-concerns-no-new-development-approvals-9.7035505" target="_blank" rel="noopener">"Region of Waterloo pauses development approvals over water capacity
  concerns"</a> <a href="#ref-1-back" aria-label="back to content">↩</a></li>
  </ol>
