# PRD --- Web Element Annotator

**Status:** Draft\
**Product Type:** Chrome Extension\
**Platform:** Chromium-based browsers\
**Primary Goal:** Memudahkan user memilih elemen pada halaman web,
menambahkan anotasi, mengumpulkan context elemen yang relevan, lalu
menyalinnya ke clipboard untuk diberikan ke AI agent apa pun.

------------------------------------------------------------------------

## 1. Product Overview

**Web Element Annotator** adalah Chrome Extension ringan untuk membantu
user memberikan context visual/DOM kepada AI coding agent.

User dapat memilih elemen langsung dari halaman web, seperti menggunakan
fitur **Inspect Element**, kemudian memberikan catatan atau instruksi.
Extension secara otomatis mengambil informasi elemen yang relevan dan
menyimpannya sebagai annotation.

Annotation dapat:

-   langsung di-copy satu per satu;
-   ditambahkan ke daftar;
-   dipilih beberapa sekaligus;
-   di-copy sebagai kumpulan annotation;
-   atau di-copy seluruhnya.

Output dibuat dalam format Markdown yang mudah dibaca manusia maupun AI
agent.

Extension bersifat **agent-agnostic**. Tidak ada integrasi khusus dengan
OpenCode atau AI provider tertentu.

------------------------------------------------------------------------

## 2. Problem

Ketika menggunakan AI agent untuk mengubah atau memperbaiki website,
user sering perlu menjelaskan elemen yang dimaksud secara manual.

Contoh:

> "Tolong ubah tombol biru di sebelah kanan menjadi lebih besar."

AI agent belum tentu mengetahui tombol mana yang dimaksud.

User kemudian harus membuka DevTools, mencari selector, melihat HTML,
menyalin informasi, mengambil screenshot, atau menjelaskan posisi elemen
secara manual.

Proses tersebut memakan waktu dan tidak nyaman.

### Solution

Extension menyediakan workflow sederhana:

``` text
Activate Picker
      ↓
Select Element
      ↓
Write Annotation
      ↓
Copy / Add to List
      ↓
Copy Selected / Copy All
      ↓
Paste ke AI Agent
```

------------------------------------------------------------------------

## 3. Product Principles

### 3.1 Lightweight

Extension harus memiliki overhead seminimal mungkin.

Tidak membutuhkan:

-   AI API
-   backend
-   database server
-   account/login
-   cloud service
-   analytics wajib
-   agent runtime
-   integrasi provider AI

### 3.2 Agent Agnostic

Output harus dapat digunakan oleh AI agent apa pun, termasuk tetapi
tidak terbatas pada:

-   OpenCode
-   Codex
-   Claude Code
-   Gemini CLI
-   Kilo Code
-   Cursor
-   Windsurf
-   Roo Code
-   Cline
-   OpenClaw
-   custom AI agent

Extension hanya bertugas menghasilkan **context**, bukan menjalankan
agent.

### 3.3 Context-Rich, Not Data-Heavy

Extension harus mengambil informasi yang cukup lengkap untuk
mengidentifikasi dan memahami elemen, tetapi tidak melakukan dump
seluruh halaman.

Prinsip:

> Ambil informasi yang relevan terhadap elemen yang dipilih, bukan
> seluruh DOM website.

### 3.4 Local-First

Semua annotation diproses dan disimpan secara lokal di browser pada MVP.

Tidak ada data halaman yang dikirim ke server.

------------------------------------------------------------------------

# 4. Target Users

Target utama:

-   developer yang menggunakan AI coding agent;
-   frontend developer;
-   web designer yang bekerja bersama AI;
-   pengguna AI agent yang perlu menjelaskan bagian tertentu dari
    website;
-   developer yang sering melakukan UI iteration dengan AI.

------------------------------------------------------------------------

# 5. Core User Flow

## 5.1 Single Annotation

``` text
User membuka website
        ↓
Aktifkan Element Picker
        ↓
Hover element
        ↓
Klik element
        ↓
Extension mengumpulkan context
        ↓
Annotation Composer muncul
        ↓
User menulis instruksi
        ↓
Copy
```

Hasil annotation langsung masuk clipboard.

------------------------------------------------------------------------

## 5.2 Multiple Annotations

``` text
Select Element
      ↓
Write Note
      ↓
Add to List
      ↓
Select another Element
      ↓
Write Note
      ↓
Add to List
      ↓
Repeat
      ↓
Select annotations
      ↓
Copy Selected / Copy All
```

------------------------------------------------------------------------

# 6. Element Picker

## Activation

Default shortcut:

``` text
Alt + A
```

Shortcut harus dapat dikustomisasi melalui Chrome extension shortcut
settings.

Element picker juga dapat diaktifkan melalui popup/icon extension.

## Hover Behavior

Ketika picker aktif dan cursor diarahkan ke elemen:

-   elemen diberi outline;
-   elemen tidak boleh mengalami perubahan layout;
-   informasi singkat dapat ditampilkan.

Contoh:

``` text
button.btn-primary
120 × 40
```

## Selection

Ketika user melakukan click:

1.  picker menangkap elemen;
2.  mengambil context elemen;
3.  menampilkan Annotation Composer.

## Cancel

Tekan:

``` text
Esc
```

untuk keluar dari picker tanpa membuat annotation.

------------------------------------------------------------------------

# 7. Element Information

Saat element dipilih, extension mengumpulkan informasi yang relevan.

## 7.1 Basic Identity

Data:

-   tag name;
-   element ID;
-   class names;
-   role;
-   accessible name jika tersedia.

Contoh:

``` text
Tag: button
ID: submit
Classes: btn btn-primary
Role: button
```

------------------------------------------------------------------------

## 7.2 Text Content

Mengambil text yang relevan dari element.

Contoh:

``` text
Submit Transaction
```

Tidak mengambil seluruh text halaman.

------------------------------------------------------------------------

## 7.3 Attributes

Mengambil attributes yang relevan, misalnya:

``` json
{
  "type": "submit",
  "aria-label": "Submit transaction",
  "data-testid": "submit-button"
}
```

Attributes internal yang tidak berguna dapat difilter.

------------------------------------------------------------------------

## 7.4 CSS Selector

Extension menghasilkan selector yang relatif stabil.

Contoh:

``` css
#submit-button
```

atau:

``` css
form.transaction-form button.btn-primary
```

Hindari selector yang terlalu rapuh jika memungkinkan, seperti:

``` css
body > div:nth-child(4) > div:nth-child(2) > button
```

------------------------------------------------------------------------

## 7.5 XPath

XPath dapat disimpan sebagai locator tambahan.

Contoh:

``` text
/html/body/main/section/form/button
```

XPath bukan satu-satunya identifier dan digunakan sebagai
fallback/context.

------------------------------------------------------------------------

## 7.6 HTML

Extension mengambil:

### Outer HTML

``` html
<button class="btn btn-primary" type="submit">
  Submit
</button>
```

### Parent / surrounding HTML

Context HTML dapat diambil secara terbatas untuk membantu agent memahami
struktur elemen.

Tidak melakukan full-page HTML dump.

------------------------------------------------------------------------

# 8. DOM Context

Extension mengambil struktur DOM di sekitar elemen.

Contoh:

``` text
main
└── section.transaction
    └── form.transaction-form
        └── div.actions
            ├── button.cancel
            └── button.submit ← TARGET
```

Context dapat mencakup:

-   parent;
-   beberapa ancestor;
-   sibling yang relevan;
-   tag/class parent;
-   heading terdekat;
-   semantic context.

Tujuannya adalah membantu AI agent menemukan elemen atau komponen yang
bersangkutan di source code.

------------------------------------------------------------------------

# 9. Computed Style

Extension mengambil computed styles yang relevan, bukan seluruh property
CSS.

Kategori yang diprioritaskan:

### Layout

-   display;
-   position;
-   width;
-   height;
-   overflow;
-   flex/grid properties yang relevan.

### Spacing

-   margin;
-   padding;
-   gap.

### Typography

-   font-family;
-   font-size;
-   font-weight;
-   line-height;
-   letter-spacing;
-   text-align.

### Color

-   color;
-   background-color;
-   opacity.

### Border

-   border;
-   border-radius.

### Visual

-   box-shadow;
-   visibility;
-   z-index jika relevan.

Contoh:

``` text
display: flex
width: 120px
height: 40px

padding: 8px 16px
margin: 0

font-size: 14px
font-weight: 500
line-height: 20px

color: rgb(...)
background-color: rgb(...)

border-radius: 8px
box-shadow: none
```

------------------------------------------------------------------------

# 10. Geometry

Extension mengambil posisi dan ukuran element.

Contoh:

``` json
{
  "x": 820,
  "y": 640,
  "width": 120,
  "height": 40
}
```

Page/viewport context:

``` text
viewport width
viewport height
devicePixelRatio
```

Geometry bersifat sebagai informasi tambahan dan bukan locator utama.

------------------------------------------------------------------------

# 11. Page Context

Setiap annotation menyimpan:

``` text
URL
Page title
```

Contoh:

``` text
URL:
https://example.com/dashboard

Title:
Transaction Dashboard
```

------------------------------------------------------------------------

# 12. Annotation Composer

Setelah element dipilih, extension menampilkan floating composer di
dekat element.

Contoh:

``` text
┌────────────────────────────────┐
│ <button.btn-primary>       ×   │
│                                │
│ Describe the change or ask     │
│ about this element...          │
│                                │
│ ┌──────────────┐ ┌───────────┐ │
│ │ + Add to list│ │   Copy    │ │
│ └──────────────┘ └───────────┘ │
└────────────────────────────────┘
```

## Input

Placeholder:

> Describe the change or ask about this element...

User dapat menulis instruksi bebas.

Contoh:

``` text
Buat tombol ini lebih besar dan gunakan warna hitam.
```

atau:

``` text
Kenapa button ini tidak responsive?
```

atau:

``` text
Ganti icon menjadi icon search.
```

------------------------------------------------------------------------

# 13. Add to List

Jika user memilih **Add to list**:

-   annotation disimpan;
-   annotation muncul pada Annotation Panel;
-   user dapat melanjutkan memilih element lain;
-   composer dapat ditutup setelah annotation disimpan.

Contoh:

``` text
Annotation #1
.hero
"Ubah background menjadi gradient"

Annotation #2
h1.title
"Buat font lebih besar"

Annotation #3
button.submit
"Buat lebih rounded"
```

------------------------------------------------------------------------

# 14. Annotation Panel

Annotation Panel ditampilkan sebagai floating sidebar di sisi kanan
halaman.

Contoh:

``` text
┌──────────────────────────────┐
│ ▣ Annotations             3  │
│                         ×    │
├──────────────────────────────┤
│                              │
│ ☑ 1  <section.hero>          │
│      Ubah background...      │
│                              │
│ ☑ 2  <h1.title>              │
│      Buat font lebih besar   │
│                              │
│ ☐ 3  <button.submit>         │
│      Buat lebih rounded      │
│                              │
├──────────────────────────────┤
│                              │
│ [ Copy Selected ] [ Copy All]│
└──────────────────────────────┘
```

------------------------------------------------------------------------

# 15. Annotation Selection

Setiap annotation memiliki checkbox.

User dapat memilih annotation tertentu:

``` text
☑ Annotation 1
☑ Annotation 2
☐ Annotation 3
☑ Annotation 4
```

Action:

``` text
Copy Selected
```

hanya menyalin annotation yang dipilih.

------------------------------------------------------------------------

# 16. Copy Single

Setiap annotation menyediakan action **Copy**.

Output contoh:

``` markdown
## Web Element Annotation

Page:
https://example.com/dashboard

### Target Element

Selector:
`button.btn-primary`

Tag:
`button`

Text:
`Submit`

HTML:

```html
<button class="btn btn-primary">
  Submit
</button>
```

Parent: `div.form-actions`

### Instruction

Buat tombol lebih besar dan rounded.


    Output harus langsung masuk clipboard dan siap di-paste ke AI agent.

    ---

    # 17. Copy Selected

    Jika user memilih beberapa annotation, extension menghasilkan satu Markdown document.

    Contoh:

    ```markdown
    # Web Element Annotations

    Page:
    https://example.com/dashboard

    ## Annotation 1

    Element:
    `h1.hero-title`

    Text:
    `Manage your transactions`

    HTML:

    ```html
    <h1 class="hero-title">
      Manage your transactions
    </h1>

Instruction: Buat font lebih besar.

------------------------------------------------------------------------

## Annotation 2

Element: `button.btn-primary`

Text: `Submit`

HTML:

``` html
<button class="btn btn-primary">
  Submit
</button>
```

Instruction: Buat lebih rounded.


    ---

    # 18. Copy All

    **Copy All** menyalin seluruh annotation yang terdapat pada list.

    Output menggunakan format yang sama dengan Copy Selected.

    ---

    # 19. Annotation Data Model

    Struktur internal MVP:

    ```typescript
    interface Annotation {
      id: string;
      url: string;
      timestamp: number;

      element: {
        tag: string;
        id?: string;
        classes: string[];
        text?: string;

        selector: string;
        xpath?: string;

        attributes: Record<string, string>;

        html: {
          outer: string;
          parent?: string;
        };

        context?: {
          parent: string;
          ancestors: string[];
          siblings?: string[];
        };

        styles?: Record<string, string>;

        rect?: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
      };

      instruction: string;
    }

Schema dapat berkembang tanpa mengubah workflow utama.

------------------------------------------------------------------------

# 20. Storage

MVP menggunakan:

``` text
chrome.storage.local
```

Tidak membutuhkan backend.

Storage digunakan untuk menyimpan annotation list dan state yang
diperlukan extension.

User dapat:

-   menghapus annotation individual;
-   menghapus semua annotation;
-   memulai list baru.

------------------------------------------------------------------------

# 21. Output Format

### Primary format

**Markdown**

Alasan:

-   mudah dibaca manusia;
-   mudah dipahami LLM;
-   mudah di-paste;
-   kompatibel dengan berbagai AI agent;
-   tidak bergantung pada provider;
-   dapat diproses kembali dengan mudah.

### Future formats

Opsional untuk versi berikutnya:

``` text
JSON
TXT
```

Namun Markdown tetap menjadi default.

------------------------------------------------------------------------

# 22. UI / Visual Design

UI menggunakan **Catppuccin Mocha** sebagai palette utama.

## Core Colors

``` text
Base      #1e1e2e
Mantle    #181825
Crust     #11111b

Text      #cdd6f4
Subtext   #a6adc8

Blue      #89b4fa
Lavender  #b4befe
Mauve     #cba6f7

Green     #a6e3a1
Yellow    #f9e2af
Red       #f38ba8
Peach     #fab387
Teal      #94e2d5
```

## UI Principles

-   dark;
-   compact;
-   minimal;
-   unobtrusive;
-   modern;
-   readable;
-   tidak mengambil terlalu banyak area website.

Extension harus terasa seperti **developer tool overlay**, bukan
aplikasi penuh.

------------------------------------------------------------------------

# 23. Visual Interaction

### Element Picker

Selected element:

``` text
Blue / Lavender outline
```

### Annotation Marker

Annotation yang sudah dibuat dapat ditandai dengan marker kecil.

### Success

Gunakan warna:

``` text
Green
```

### Warning

Gunakan:

``` text
Yellow
```

### Error

Gunakan:

``` text
Red
```

### Panel

Background menggunakan kombinasi:

``` text
Base
Mantle
Crust
```

dengan border/subtle transparency bila diperlukan.

------------------------------------------------------------------------

# 24. Performance Requirements

Performance merupakan requirement utama.

Extension harus:

-   idle ketika tidak digunakan;
-   tidak melakukan scanning DOM terus-menerus;
-   tidak melakukan polling;
-   tidak melakukan network request pada MVP;
-   tidak melakukan full DOM serialization;
-   hanya menjalankan picker ketika user mengaktifkannya;
-   tidak mengganggu website;
-   tidak menyebabkan noticeable layout shift.

### Idle State

``` text
Picker: OFF
DOM scanning: OFF
Network: NONE
AI processing: NONE
```

------------------------------------------------------------------------

# 25. Privacy

Semua data diproses secara lokal.

MVP tidak membutuhkan:

``` text
Account
Login
API key
Backend
Cloud database
```

URL, HTML, text, style, dan annotation tidak dikirim ke server.

------------------------------------------------------------------------

# 26. Technical Stack

Recommended:

``` text
TypeScript
Vite
Chrome Extension Manifest V3
Vanilla DOM
CSS
chrome.storage.local
Clipboard API
```

React tidak diperlukan untuk MVP agar extension tetap ringan.

------------------------------------------------------------------------

# 27. Suggested Project Structure

``` text
web-element-annotator/
│
├── src/
│   ├── content/
│   │   ├── picker.ts
│   │   ├── inspector.ts
│   │   ├── composer.ts
│   │   ├── overlay.ts
│   │   └── styles.css
│   │
│   ├── background/
│   │   └── index.ts
│   │
│   ├── popup/
│   │   ├── index.html
│   │   └── popup.ts
│   │
│   ├── storage/
│   │   └── annotations.ts
│   │
│   └── shared/
│       └── types.ts
│
├── public/
│   ├── manifest.json
│   └── icons/
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

------------------------------------------------------------------------

# 28. MVP Features

## Must Have

-   [ ] Manifest V3
-   [ ] Element picker
-   [ ] Hover highlight
-   [ ] Element selection
-   [ ] Keyboard shortcut
-   [ ] Escape to cancel
-   [ ] Element tag
-   [ ] ID
-   [ ] Classes
-   [ ] Text content
-   [ ] Attributes
-   [ ] CSS selector
-   [ ] XPath
-   [ ] Outer HTML
-   [ ] Parent/context
-   [ ] Relevant computed styles
-   [ ] Geometry
-   [ ] URL
-   [ ] Page title
-   [ ] Annotation composer
-   [ ] Add to list
-   [ ] Annotation panel
-   [ ] Checkbox selection
-   [ ] Copy single
-   [ ] Copy selected
-   [ ] Copy all
-   [ ] Delete annotation
-   [ ] Clear annotations
-   [ ] Local storage
-   [ ] Catppuccin Mocha theme

------------------------------------------------------------------------

# 29. Explicitly Out of Scope for MVP

Untuk menjaga produk tetap ringan, MVP tidak mencakup:

-   AI/chat;
-   LLM API;
-   automatic code editing;
-   OpenCode integration;
-   Claude integration;
-   Codex integration;
-   MCP;
-   Git integration;
-   backend;
-   account/login;
-   cloud synchronization;
-   collaboration;
-   project management;
-   browser automation;
-   automatic website modification.

Extension hanya menghasilkan annotation/context.

------------------------------------------------------------------------

# 30. Future Features

Fitur berikut dapat dipertimbangkan setelah MVP stabil.

## 30.1 Screenshot Context

Menambahkan screenshot viewport atau crop elemen ke annotation.

``` text
Element Context
+
Screenshot
+
User Instruction
```

## 30.2 Output Detail Level

``` text
Compact
Standard
Detailed
```

Standard menjadi default.

## 30.3 Export

``` text
Markdown
JSON
TXT
```

## 30.4 Annotation Groups

``` text
Homepage
├── Navbar
├── Hero
└── Footer
```

## 30.5 Import

Memungkinkan annotation list dipindahkan atau dimuat kembali.

## 30.6 AI Agent Integration

Di masa depan dapat ditambahkan integrasi:

``` text
Send to OpenCode
Send to Claude Code
Send to Codex
Send to Custom Agent
```

Namun fitur tersebut tidak menjadi bagian dari core product.

------------------------------------------------------------------------

# 31. Definition of Done

MVP dianggap selesai apabila user dapat melakukan workflow berikut:

``` text
1. Buka website
       ↓
2. Tekan Alt + A
       ↓
3. Hover element
       ↓
4. Klik element
       ↓
5. Extension mengumpulkan context
       ↓
6. Tulis annotation
       ↓
7. Add to list
       ↓
8. Pilih element lain
       ↓
9. Add to list
       ↓
10. Pilih annotation yang diinginkan
       ↓
11. Copy Selected / Copy All
       ↓
12. Paste ke AI Agent
```

Hasil copy harus sudah berisi informasi yang cukup untuk membantu AI
agent:

-   menemukan target;
-   memahami element;
-   memahami struktur di sekitarnya;
-   melihat kondisi element;
-   memahami instruksi user.

User tidak perlu menyusun ulang informasi element secara manual.

------------------------------------------------------------------------

# 32. Success Criteria

Produk berhasil apabila:

1.  User dapat membuat annotation dalam beberapa detik.
2.  Element dapat diidentifikasi dengan informasi yang cukup.
3.  Output dapat langsung di-paste ke AI agent.
4.  Multiple annotations dapat dikumpulkan dengan mudah.
5.  User dapat memilih annotation tertentu sebelum copy.
6.  Extension tidak terasa berat ketika browser digunakan normal.
7.  Tidak diperlukan akun atau konfigurasi server.
8.  Output tetap berguna tanpa bergantung pada AI provider tertentu.

------------------------------------------------------------------------

# 33. Core Product Statement

> **Web Element Annotator turns "point at this element and tell the AI
> what I want" into structured context that can be pasted directly into
> any AI agent.**

### Core workflow

``` text
Alt + A
   ↓
Select
   ↓
Annotate
   ↓
Add
   ↓
Select annotations
   ↓
Copy
   ↓
Paste to any AI Agent
```

**Core philosophy:**

> **Point. Annotate. Copy. Let the agent handle the rest.**
