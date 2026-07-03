# Digital Archive Services Agreement

This Services Agreement (the "Agreement") is entered into as of [date] (the
"Effective Date") by and between:

- **[Your studio name]**, [entity type and jurisdiction, e.g. "a sole
  proprietorship organized in [state/country]"] ("Provider"); and
- **[Client / institution legal name]**, [entity type and jurisdiction]
  ("Client").

Provider and Client are each a "Party" and together the "Parties."

---

## 1. Services

Provider will digitize and structure the document collection described in
**Exhibit A** (the "Collection") and deliver a searchable digital archive built
from it (the "Services"). The specific volumes, record types, fields, formats,
and milestones are set out in Exhibit A and any mutually signed statement of work
("SOW"). If Exhibit A and this Agreement conflict, Exhibit A controls for that
engagement.

## 2. Deliverables

Provider will deliver:

1. A **structured dataset** of the Collection in SQLite, CSV, and JSON formats.
2. A **searchable website** generated from that dataset, including per-record
   links to the corresponding source images and multi-format record exports
   (CSV, JSON, Markdown, and print/PDF).
3. The **pipeline source code** used to produce (1) and (2), and documentation
   sufficient for Client's technical staff to rebuild and extend the archive.

Collectively, the "Deliverables."

## 3. Source material & responsibilities

3.1 **Client provides** the source scans, PDFs, and/or access to the digital
collection for the Collection, together with any existing OCR text, and confirms
it has the right to have this material processed as contemplated here.

3.2 **Provider provides** the pipeline, extraction, dataset compilation, site
build, and deployment described in Section 2.

3.3 **Review.** Client will review a representative sample of extracted records
early in the engagement and confirm the extraction schema and text-correction
policy before the full run. Client will designate one point of contact with
authority to give this sign-off.

## 4. Accuracy & source fidelity

4.1 The Deliverables are produced by automated OCR and AI-assisted extraction from
historical documents. Provider corrects obvious OCR errors and never paraphrases
source text; original strings are preserved and each record links to its source
image so it can be independently verified.

4.2 Provider does **not** warrant that every record is free of transcription error
inherent to the source scans. Records carry confidence indicators to guide Client
review. The archive is a research and access tool, not a certified or authoritative
record of the underlying facts.

## 5. Timeline

Provider will use commercially reasonable efforts to meet the milestones in
Exhibit A. Dates depend on timely delivery of source material and Client review
sign-offs under Section 3; delays in either extend Provider's dates accordingly.

## 6. Fees

Fees, payment schedule, and expenses are set out in **Exhibit B (Fees)**, provided
separately and incorporated by reference when signed by both Parties. No fee terms
are stated in the body of this Agreement.

## 7. Intellectual property

7.1 **Client ownership.** On full payment for an engagement, Provider assigns to
Client all right, title, and interest in the **Deliverables** for that engagement:
the dataset, the exports, the generated website, and the project-specific pipeline
configuration.

7.2 **Provider tools.** Provider retains ownership of its general-purpose tools,
libraries, methods, and know-how ("Provider Tools") that exist independently of the
engagement, and grants Client a perpetual, worldwide, royalty-free license to use
any Provider Tools embedded in the Deliverables as needed to operate, host, and
extend the archive.

7.3 **Source material** remains the property of Client or its licensors; nothing
here transfers rights in the underlying documents.

7.4 **Portfolio use.** Unless Client notifies Provider otherwise in writing,
Provider may identify Client and display non-confidential samples of the public
archive as a portfolio reference.

## 8. Confidentiality

Each Party will protect the other's non-public information disclosed under this
Agreement with the same care it uses for its own confidential information, and use
it only to perform or receive the Services. Publicly available collection material
is not confidential.

## 9. Warranties & disclaimer

Provider warrants that it will perform the Services in a professional and
workmanlike manner. **Except as expressly stated, the Deliverables are provided
"as is," and Provider disclaims all other warranties, express or implied,
including merchantability and fitness for a particular purpose.** See Section 4
regarding source-derived accuracy.

## 10. Limitation of liability

To the maximum extent permitted by law, neither Party is liable for indirect,
incidental, special, or consequential damages, and each Party's total aggregate
liability arising out of this Agreement will not exceed the fees paid or payable
for the engagement giving rise to the claim.

## 11. Term & termination

11.1 This Agreement begins on the Effective Date and continues until the
engagement is complete or it is terminated as provided here.

11.2 Either Party may terminate for the other's material breach not cured within
[15] days of written notice.

11.3 On termination, Client will pay for Services performed and accepted through
the termination date, and Provider will deliver work product for which it has been
paid. Sections 4, 7, 8, 9, 10, and 12 survive termination.

## 12. General

12.1 **Independent contractor.** Provider is an independent contractor, not an
employee, partner, or agent of Client.

12.2 **Assignment.** Neither Party may assign this Agreement without the other's
written consent, except to a successor in interest to substantially all of its
business.

12.3 **Governing law.** This Agreement is governed by the laws of [jurisdiction],
without regard to conflict-of-laws rules.

12.4 **Entire agreement.** This Agreement, with its Exhibits and any signed SOW,
is the entire agreement between the Parties on this subject and supersedes prior
discussions. Amendments must be in writing and signed by both Parties.

---

**Agreed and accepted:**

| Provider | Client |
|---|---|
| [Your studio name] | [Client legal name] |
| Signature: ______________________ | Signature: ______________________ |
| Name: [name] | Name: [name] |
| Title: [title] | Title: [title] |
| Date: ____________ | Date: ____________ |

---

## Exhibit A — Statement of Work

- **Collection:** [name, description]
- **Volumes / range:** [e.g. annual reports 1870–1941, 72 volumes]
- **Estimated pages:** [n]
- **Record types:** [obituaries, death notices, roster entries, …]
- **Fields per record:** [list]
- **Deliverable formats:** Search site + SQLite + CSV + JSON
- **On-site export formats:** CSV, JSON, Markdown, print/PDF
- **Hosting / domain:** [Cloudflare Pages at <domain>]
- **Milestones:**
  1. Kickoff & sample review — [date]
  2. Schema sign-off — [date]
  3. Full extraction & dataset — [date]
  4. Site deployment — [date]
  5. Review & handoff — [date]
- **Review cycles included:** [n]

## Exhibit B — Fees

*Provided separately.*
