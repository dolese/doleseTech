Every website you have ever opened is built from two languages. HTML says what is on the page: this is a heading, this is a table of marks, this is a button. CSS says how it looks: navy here, green there, this much space between rows. In this chapter you will use both to build the first real piece of the project — the results page of a school, with a header, a summary, a table of marks with coloured grades, and a form for entering new marks. It will work on a computer, on a phone and on paper.

By the end of this chapter you will be able to:

- install a code editor and open your project in it;
- write a complete HTML page and view it in a browser;
- use headings, paragraphs, lists, links, images, tables and forms;
- explain what elements, tags and attributes are, and nest them correctly;
- write CSS rules that change colours, fonts, spacing and layout;
- arrange parts of a page side by side with flexbox;
- make a page that works on a phone and prints cleanly;
- find your own mistakes with the browser's developer tools.

All the schools, teachers and students in this book are invented. Any resemblance to a real school is a coincidence.

## 2.1 Two languages, one page

Think of a web page as a classroom block being built. **HTML is the structure**: the walls, the doors, the windows, which room is which. **CSS is the finish**: the paint, the size of the windows, where the noticeboard hangs. You can have a building with no paint, and it still works — and you can have a page with no CSS, and it still works. But you cannot paint a wall that was never built.

That is why we write the HTML first and the CSS second, and why we keep them in separate files:

| File | Language | Job |
|---|---|---|
| `results.html` | HTML (HyperText Markup Language) | What is on the page, and what each part *is* |
| `style.css` | CSS (Cascading Style Sheets) | How each part *looks* |

Neither HTML nor CSS is a programming language in the full sense — they do not make decisions or do calculations. That arrives with JavaScript in Chapter 3. But every web developer, however experienced, writes HTML and CSS every day.

## 2.2 Your tools

You need two programs: a code editor to write the files, and a browser to view them.

### Install Visual Studio Code

*Visual Studio Code* (VS Code) is a free code editor from Microsoft. It colours your code so that mistakes stand out, closes tags for you, and works for every language in this book.

1. Open **code.visualstudio.com** in your browser — check the address carefully, as Chapter 7 taught you.
2. Download the installer for Windows and run it. Accept the defaults, and tick **Add "Open with Code" action** when it is offered.
3. Start VS Code. Choose **File → Open Folder…**, find the `results-system` folder you created in Chapter 1, and open it.
4. In the panel on the left, open the `web` folder. Click the **New File** icon and name the file `results.html`.

> **Tip:** Turn on **File → Auto Save**. VS Code will then save your work a moment after you stop typing, and you will never wonder why the browser is still showing the old page.

### Viewing your page

Find `results.html` in File Explorer and double-click it. It opens in your browser, and the address bar shows a path that starts with `file:///` — the browser is reading the file straight from your disk, with no server involved. Arrange VS Code and the browser side by side (`Windows + ←` and `Windows + →`). Each time you change the file, switch to the browser and press `Ctrl + R` to reload.

## 2.3 Your first page

Type this into `results.html`. Type it rather than copying it: your fingers learn where the angle brackets and slashes are.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Form 4 Results</title>
</head>
<body>
  <h1>Mwangaza Secondary School</h1>
  <p>Form 4 results will appear here.</p>
</body>
</html>
```

Save and open it in the browser. You will see a large heading and one line of text. The tab at the top of the browser shows "Form 4 Results".

Every HTML page you ever write starts with the same skeleton. Here is what each part does.

| Line | What it means |
|---|---|
| `<!DOCTYPE html>` | "This is a modern HTML page." Always the very first line |
| `<html lang="en">` | The start of the page. `lang="en"` says the text is in English, which helps screen readers and translation tools. A page in Kiswahili would use `lang="sw"` |
| `<head>` … `</head>` | Information *about* the page. Nothing in here appears in the page itself |
| `<meta charset="utf-8">` | The character set. UTF-8 can show every letter and symbol in every language |
| `<title>` | The text in the browser tab, in bookmarks and in search results |
| `<body>` … `</body>` | Everything the visitor sees |

## 2.4 Elements, tags and attributes

HTML is made of *elements*. Most elements have an opening tag, some content and a closing tag:

```html
<a href="https://www.necta.go.tz">necta.go.tz</a>
```

- `<a ...>` is the **opening tag**. `a` is the element's name — `a` for *anchor*, which makes a link.
- `href="https://www.necta.go.tz"` is an **attribute**: extra information about the element, written as `name="value"` inside the opening tag. Here it says where the link goes.
- `necta.go.tz` is the **content** — the words the visitor sees and clicks.
- `</a>` is the **closing tag**. It is the same name with a forward slash in front.

A few elements have no content and no closing tag, because there is nothing to put inside them. They are called *void elements*. You have already met `<meta>`; others are `<img>`, `<input>`, `<link>` and `<br>`.

### Nesting

Elements go inside other elements. The rule is simple: **close them in the reverse order you opened them**, like boxes inside boxes.

```html
<p>Class teacher: <strong>Mwl. Grace Mushi</strong></p>
```

The `<strong>` opens inside the `<p>`, so it must close before the `</p>`. Writing `<p><strong>…</p></strong>` is wrong, and browsers guess the fix in ways you may not expect.

Indent the inside of each element by two spaces. The browser does not care, but you will: with indentation you can see at a glance what is inside what. VS Code indents for you as you type.

### The elements you will use most

| Element | What it is | Example |
|---|---|---|
| `h1` to `h6` | Headings, from most to least important | `<h2>Results</h2>` |
| `p` | A paragraph | `<p>Class teacher: …</p>` |
| `strong`, `em` | Important text (bold); emphasised text (italic) | `<strong>Mwl. Grace Mushi</strong>` |
| `a` | A link | `<a href="page.html">Next</a>` |
| `img` | An image | `<img src="logo.png" alt="School badge">` |
| `ul`, `ol`, `li` | A bulleted list, a numbered list, and one item in either | `<li>5 students</li>` |
| `table`, `tr`, `th`, `td` | A table, a row, a heading cell, an ordinary cell | See section 2.8 |
| `form`, `label`, `input`, `select`, `button` | A form and its parts | See section 2.9 |
| `header`, `main`, `section`, `footer` | The large parts of a page | See section 2.10 |
| `div`, `span` | Plain containers with no meaning, used for styling | `<div class="table-wrap">` |

## 2.5 Headings and text

Replace the body of your page with a proper header. We will add `class` attributes now — they mean nothing yet, but in section 2.11 the CSS will use them.

```html
<header class="site-header">
  <img src="logo.png" alt="Mwangaza Secondary School badge" width="56" height="56">
  <div>
    <h1>Mwangaza Secondary School</h1>
    <p>P.O. Box 1234, Dodoma</p>
  </div>
</header>
```

Use headings for their meaning, not their size. A page has **one** `h1`, its main title. The sections under it use `h2`; parts of those sections use `h3`. Never skip a level to get smaller text — that is CSS's job. Search engines and screen readers for blind visitors use the headings as the page's table of contents.

> **Remember:** HTML says what something *is*. If you are choosing an element because of how it looks, stop and ask which element describes it, then change the look with CSS.

## 2.6 Lists

Below the header, the page opens with three numbers a head teacher wants to see first. They are a list of separate facts, so they go in a list.

```html
<ul class="stats">
  <li><span>5</span> students</li>
  <li><span>66.3</span> class average</li>
  <li><span>Neema Kileo</span> top student</li>
</ul>
```

`ul` is an *unordered* list — the browser shows bullets. Use `ol`, an *ordered* list, when the order matters, such as steps to follow; the browser numbers the items for you. Each `<span>` marks the number inside its item so that CSS can make it large and green later.

## 2.7 Links and images

### Links

The `href` of a link can be written in two ways.

- An **absolute** address includes everything, starting with `https://`. Use it for other websites: `<a href="https://www.necta.go.tz">necta.go.tz</a>`.
- A **relative** address is measured from the folder the current page is in. Use it for your own pages: `<a href="subjects.html">Subjects</a>` opens `subjects.html` from the same folder.

### Images

```html
<img src="logo.png" alt="Mwangaza Secondary School badge" width="56" height="56">
```

- `src` is the image file, with a relative or absolute address, exactly like `href`.
- `alt` is the *alternative text*: what the image shows, in words. Screen readers read it aloud, and the browser shows it if the image cannot load. Every image needs one.
- `width` and `height` are the size in pixels. Giving them lets the browser keep space for the image before it arrives, so the page does not jump about while loading.

Put a small picture called `logo.png` in your `web` folder to see it work. If you have no picture yet, leave the line in: the browser shows the alt text instead, which is exactly what it is for.

Relative addresses follow the folders on your disk:

| `src` | Finds the file |
|---|---|
| `logo.png` | In the same folder as the page |
| `images/logo.png` | In a folder called `images` inside the page's folder |
| `../logo.png` | In the folder one level *above* the page's folder |

### Keep images small

In Chapter 1 you saw that one phone photo can be 2 to 5 MB, and that many of your visitors pay for every megabyte. An image on a web page rarely needs to be more than about 1,600 pixels wide, and a badge like this one needs about 112. Before you put a photo on a page:

- resize it to the size it will be shown at (Windows Photos: **… → Resize image**);
- save photos as `.jpg` and logos and drawings as `.png`;
- aim for under 200 KB per photo. Free websites such as squoosh.app make images much smaller with no visible difference;
- add `loading="lazy"` to images further down a long page, so they are only downloaded if the visitor scrolls to them.

## 2.8 Tables

A table is the right element for data with rows and columns — and marks are exactly that.

```html
<table>
  <caption>Marks out of 100. Grades: A 75-100, B 65-74, C 45-64, D 30-44, F 0-29.</caption>
  <thead>
    <tr>
      <th scope="col">No.</th>
      <th scope="col">Student</th>
      <th scope="col">Mathematics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Amina Juma</td>
      <td>78</td>
    </tr>
  </tbody>
</table>
```

| Element | Meaning |
|---|---|
| `table` | The whole table |
| `caption` | A title or note for the table, shown above it |
| `thead` | The heading rows |
| `tbody` | The body rows — the data itself |
| `tr` | One *table row* |
| `th` | A heading cell. `scope="col"` says it is the heading of its column |
| `td` | An ordinary *table data* cell |

Every row must have the same number of cells as the heading row. If one row has a cell too many or too few, the columns slide out of line — count them when a table looks wrong.

The complete page in section 2.20 has eight columns — number, name, sex, three subjects, average and grade — and five students. The averages are worked out by hand for now: Amina's is (78 + 85 + 81) ÷ 3 = 81.3. Doing that by hand for a whole school is slow and easy to get wrong, which is exactly what Chapter 3 fixes.

> **Warning:** Use tables only for data. Before CSS layout was good, people used tables to arrange whole pages. Those pages are hard to read on a phone and confusing for screen readers.

## 2.9 Forms

Teachers need to enter marks, so the page gets a form.

```html
<form>
  <label for="student">Student</label>
  <select id="student" name="student">
    <option>Amina Juma</option>
    <option>Baraka Mushi</option>
  </select>

  <label for="mark">Mark (0 to 100)</label>
  <input id="mark" name="mark" type="number" min="0" max="100" required>

  <button type="submit">Save mark</button>
</form>
```

- A `label` names a box. Its `for` attribute must match the `id` of the box it belongs to. Then clicking the label puts the cursor in the box, and screen readers announce the label when the box is reached.
- `select` makes a drop-down list. Each `option` is one choice.
- `input` makes a box to type in. Its `type` decides what kind: `text`, `number`, `email`, `tel`, `date`, `password` and more. On a phone, `type="number"` opens the number keypad.
- `min`, `max` and `required` are checks the browser does for you. Try it: type `150` and click **Save mark**. The browser refuses and explains why, without a single line of programming.
- An `id` must be unique on the page; no two elements may share one.

For now, clicking **Save mark** with a valid mark just reloads the page — there is nowhere for the mark to go yet. Chapter 3 catches the click with JavaScript, and Chapter 4 gives the marks a database to live in.

> **Warning:** Checks in the browser make forms friendlier, but they are not security. Anyone can switch them off in a few seconds. A real system must check the data again on the server, as later chapters do.

## 2.10 The structure of the page

Put the parts of the page in the large structural elements:

```html
<body>
  <header class="site-header">…</header>
  <main>
    <section>…summary…</section>
    <section>…results table…</section>
    <section class="entry">…form…</section>
  </main>
  <footer>…</footer>
</body>
```

| Element | Use it for |
|---|---|
| `header` | The top of the page: name, badge, often the menu |
| `main` | The main content. One per page |
| `section` | A group of related content, normally with its own heading |
| `footer` | The bottom of the page: contact details, links, copyright |

These look exactly like `div` elements until you style them, but they tell screen readers and search engines how the page is organised. A blind teacher using a screen reader can jump straight to `main`, or from section to section.

Your page now has all of its content. Open it in the browser: it is plain black text on white, with a table that has no lines. Everything is there — it just needs the finish.

## 2.11 Adding CSS

Create a second file in the `web` folder called `style.css`, and connect it to the page by adding this line inside the `head` of `results.html`:

```html
<link rel="stylesheet" href="style.css">
```

### The shape of a rule

CSS is a list of *rules*. Each rule chooses some elements and says how they should look.

```css
.site-header h1 {
  margin: 0;
  font-size: 1.5rem;
}
```

- `.site-header h1` is the **selector**: which elements the rule applies to.
- Inside the curly braces are **declarations**, each a **property**, a colon, a **value** and a semicolon.
- `/* like this */` is a comment. The browser ignores it; people reading your CSS do not.

### Choosing elements: selectors

| Selector | Chooses | Example |
|---|---|---|
| `p` | Every element of that kind | `label { font-weight: 600; }` |
| `.name` | Every element with `class="name"` | `.num { text-align: right; }` |
| `#name` | The one element with `id="name"` | `#mark { … }` |
| `a b` | Every `b` *inside* an `a` | `.site-header p { … }` |
| `a, b` | Both `a` and `b` | `th, td { … }` |
| `:hover` | An element while the mouse is over it | `button:hover { … }` |
| `:nth-child(even)` | Every second element: the 2nd, 4th, 6th… | `tbody tr:nth-child(even) { … }` |
| `*` | Every element | `* { box-sizing: border-box; }` |

Classes are the selector you will use most. One element can have several classes, separated by spaces: `<span class="grade grade-a">` has both `grade` and `grade-a`, so the general badge style and the green colour both apply.

### Why "cascading"

When two rules set the same property on the same element, the browser has to choose. Broadly: a more specific selector wins over a less specific one (an id beats a class, and a class beats an element name), and if they are equally specific, the rule that comes **later** in the file wins. This is the *cascade*. When a style you wrote "does nothing", another rule is usually winning — section 2.18 shows how to see which.

## 2.12 Colours and text

Start `style.css` with the rules for the whole page:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1b2435;
  background: #f4f6f8;
}
```

- **Colours** are most often written as a `#` followed by six hexadecimal digits: two each for red, green and blue, from `00` (none) to `ff` (full). `#ffffff` is white, `#000000` is black, and `#1b2435` is a dark navy — a little red, a little more green, a fair amount of blue. Colour pickers in VS Code and in the browser's developer tools write these for you.
- **`font-family`** lists fonts in order of preference. The browser uses the first one the computer has. Always end with a general family — `sans-serif` or `serif` — as the last resort.
- **`line-height: 1.5`** makes each line one and a half times as tall as the text, which is much easier to read than the browser's default.
- **`rem`** is a unit equal to the page's base font size, here 16 pixels. `1.5rem` is 24 pixels. Sizing text in `rem` keeps everything in proportion if a reader makes the text larger.

Text colours must stand out clearly from their background. Dark text on a light background, or white text on a dark one, is readable in sunlight on a cheap phone; grey on grey is not.

## 2.13 The box model

To CSS, every element is a rectangular box made of four layers, from the inside out:

```text
┌─────────────────── margin ───────────────────┐
│  ┌──────────────── border ───────────────┐   │
│  │  ┌───────────── padding ──────────┐   │   │
│  │  │                                │   │   │
│  │  │            content             │   │   │
│  │  │                                │   │   │
│  │  └────────────────────────────────┘   │   │
│  └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

| Layer | What it is | Example |
|---|---|---|
| Content | The text or image itself | `max-width: 960px;` |
| Padding | Space *inside* the border, around the content. Takes the background colour | `padding: 20px;` |
| Border | A line around the padding | `border: 1px solid #dde2e8;` |
| Margin | Space *outside* the border, between this box and its neighbours | `margin-bottom: 24px;` |

The sections of our page are white boxes on a grey background:

```css
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

section {
  background: #ffffff;
  border: 1px solid #dde2e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
```

`max-width: 960px` stops the content stretching across a very wide screen, where lines become too long to read. `margin: 0 auto` means "no margin at the top and bottom, and share the remaining space equally left and right" — which centres the box. `border-radius` rounds the corners.

The `* { box-sizing: border-box; }` rule at the top of the file makes widths include the padding and border. Without it, a box set to 320 pixels wide with 8 pixels of padding would actually be 336 pixels wide, which surprises everyone.

## 2.14 Side by side with flexbox

Elements such as `div`, `p`, `section` and `li` are *blocks*: each starts on a new line and stacks under the one before. To put things side by side, give their container `display: flex`.

```css
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #1b2435;
  color: #ffffff;
}
```

Now the badge and the school name sit in a row. `align-items: center` lines them up through their middles, and `gap` puts 16 pixels between them.

The three numbers at the top use the same idea, with one addition:

```css
.stats {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stats li {
  flex: 1 1 160px;
  padding: 12px;
  background: #eef8ee;
  border-radius: 6px;
}
```

`flex: 1 1 160px` tells each item: start at 160 pixels wide, grow to share any spare space, and shrink if you must. With `flex-wrap: wrap`, items that do not fit move to a new row. On a computer the three boxes sit in one row; on a narrow phone the third drops underneath — with no extra rules at all. `list-style: none` removes the bullets.

## 2.15 Styling the table

```css
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #dde2e8;
}

thead th {
  background: #1b2435;
  color: #ffffff;
}

tbody tr:nth-child(even) {
  background: #f4f6f8;
}

.num {
  text-align: right;
}
```

- `border-collapse: collapse` merges the borders of neighbouring cells into single lines, instead of the browser's default double lines.
- Shading every second row — *zebra stripes* — helps the eye follow a row across a wide table.
- Numbers line up best on the right, so that units sit under units and tens under tens. In the HTML, every number cell and its heading has `class="num"`.

The grade in the last column gets a coloured badge. Every grade shares the `grade` class for its shape, and has a second class for its colour:

```css
.grade {
  display: inline-block;
  min-width: 2em;
  text-align: center;
  border-radius: 4px;
  font-weight: bold;
}

.grade-a { background: #d4f0d2; color: #1d5e1a; }
.grade-b { background: #dbeafe; color: #1e4f8a; }
```

The full file also has `grade-c`, `grade-d` and `grade-f`. Notice that the letter is still in the HTML — `<span class="grade grade-a">A</span>`. Colour helps, but some readers cannot tell red from green, and a page printed in black and white loses colour altogether. Never let colour be the only way information is shown.

## 2.16 Making it work on a phone

Most of your visitors will open the page on a phone. Three things make it work.

**The viewport tag.** Without it, phones pretend to be a wide computer screen and shrink the whole page until it is too small to read. Add it to the `head`, under the `charset` line:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Tables that scroll.** A table with eight columns does not fit across a phone. Wrap it in a `div` and let only the table scroll sideways, rather than the whole page:

```html
<div class="table-wrap">
  <table>…</table>
</div>
```

```css
.table-wrap {
  overflow-x: auto;
}
```

**Media queries.** A *media query* applies rules only when a condition is true — here, when the screen is 600 pixels wide or less:

```css
@media (max-width: 600px) {
  .site-header {
    padding: 12px 16px;
  }

  main {
    padding: 16px;
  }

  section {
    padding: 16px;
  }
}
```

On a phone every pixel counts, so the padding shrinks. Because the media query comes after the normal rules, its values win the cascade.

## 2.17 Printing

Results get printed for noticeboards and parents' meetings. Another media query changes the page for paper: no dark backgrounds that waste ink, and no form, since no one can type on paper.

```css
@media print {
  body,
  .site-header {
    background: #ffffff;
    color: #000000;
  }

  .entry,
  footer {
    display: none;
  }
}
```

`display: none` removes an element completely. Press `Ctrl + P` in the browser to see the print preview: one clean page with the summary and the table. The full file in section 2.20 also removes the boxes around the sections and turns the table heading black on white.

## 2.18 The developer tools

Every modern browser has *developer tools* built in. Press `F12`, or right-click any part of the page and choose **Inspect**.

- **Elements** shows your HTML as the browser understood it. Click an element to see every CSS rule that applies to it, in the **Styles** panel. A rule that lost the cascade is shown ~~crossed out~~ — that is how you find out why your style "does nothing". You can change values right there to try ideas, but the changes disappear when you reload; copy the ones you like into `style.css`.
- **Console** lists errors. If `logo.png` is missing, you will see a message that it was not found — the `404` from Chapter 1.
- The **device toolbar** (`Ctrl + Shift + M` while the tools are open) shows the page at the size of a phone, so you can test section 2.16 without one.

## 2.19 When something goes wrong

| What you see | Most likely cause |
|---|---|
| The page shows your code as text | The file is saved as `.txt`, not `.html` — turn on file extensions (Chapter 1) |
| No styles at all | The `href` in the `link` tag does not match the CSS file's name or folder, or the `link` is outside the `head` |
| One rule has no effect | A missing `;` or `}` just above it, a misspelt property, or another rule winning the cascade — check **Styles** in the developer tools |
| A class does nothing | The dot is missing in the CSS (`grade` instead of `.grade`), or the spelling differs between HTML and CSS — class names are case-sensitive |
| The image shows only its alt text | The file name or folder in `src` is wrong — check spelling, capitals and the extension |
| Half the page is bold or inside a link | A closing tag is missing, such as `</strong>` or `</a>` |
| The table columns are out of line | A row has a cell too many or too few |
| Changes do not appear | The file is not saved, or the browser was not reloaded with `Ctrl + R` |
| Tiny text on a phone | The viewport `meta` tag is missing |

> **Tip:** Paste your HTML into the free checker at **validator.w3.org** (choose **Validate by Direct Input**). It lists every missing closing tag and misspelt attribute, with line numbers.

## 2.20 The complete files

Here are both files as they should be at the end of this chapter. Compare them with yours line by line if something does not look like the description, and keep them: Chapter 3 starts from exactly here.

### `web/results.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Form 4 Results, Term 1 2026 - Mwangaza Secondary School</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <img src="logo.png" alt="Mwangaza Secondary School badge" width="56" height="56">
    <div>
      <h1>Mwangaza Secondary School</h1>
      <p>P.O. Box 1234, Dodoma</p>
    </div>
  </header>

  <main>
    <section>
      <h2>Form 4 - Term 1 examination, 2026</h2>
      <p>Class teacher: <strong>Mwl. Grace Mushi</strong></p>
      <ul class="stats">
        <li><span>5</span> students</li>
        <li><span>66.3</span> class average</li>
        <li><span>Neema Kileo</span> top student</li>
      </ul>
    </section>

    <section>
      <h2>Results</h2>
      <div class="table-wrap">
        <table>
          <caption>Marks out of 100. Grades: A 75-100, B 65-74, C 45-64, D 30-44, F 0-29.</caption>
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Student</th>
              <th scope="col">Sex</th>
              <th scope="col" class="num">Mathematics</th>
              <th scope="col" class="num">English</th>
              <th scope="col" class="num">Biology</th>
              <th scope="col" class="num">Average</th>
              <th scope="col">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Amina Juma</td>
              <td>F</td>
              <td class="num">78</td>
              <td class="num">85</td>
              <td class="num">81</td>
              <td class="num">81.3</td>
              <td><span class="grade grade-a">A</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td>Baraka Mushi</td>
              <td>M</td>
              <td class="num">52</td>
              <td class="num">61</td>
              <td class="num">47</td>
              <td class="num">53.3</td>
              <td><span class="grade grade-c">C</span></td>
            </tr>
            <tr>
              <td>3</td>
              <td>Neema Kileo</td>
              <td>F</td>
              <td class="num">91</td>
              <td class="num">88</td>
              <td class="num">94</td>
              <td class="num">91.0</td>
              <td><span class="grade grade-a">A</span></td>
            </tr>
            <tr>
              <td>4</td>
              <td>Juma Hassan</td>
              <td>M</td>
              <td class="num">34</td>
              <td class="num">49</td>
              <td class="num">38</td>
              <td class="num">40.3</td>
              <td><span class="grade grade-d">D</span></td>
            </tr>
            <tr>
              <td>5</td>
              <td>Rehema Mollel</td>
              <td>F</td>
              <td class="num">66</td>
              <td class="num">72</td>
              <td class="num">59</td>
              <td class="num">65.7</td>
              <td><span class="grade grade-b">B</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="entry">
      <h2>Enter a mark</h2>
      <form>
        <label for="student">Student</label>
        <select id="student" name="student">
          <option>Amina Juma</option>
          <option>Baraka Mushi</option>
          <option>Neema Kileo</option>
          <option>Juma Hassan</option>
          <option>Rehema Mollel</option>
        </select>

        <label for="subject">Subject</label>
        <select id="subject" name="subject">
          <option>Mathematics</option>
          <option>English</option>
          <option>Biology</option>
        </select>

        <label for="mark">Mark (0 to 100)</label>
        <input id="mark" name="mark" type="number" min="0" max="100" required>

        <button type="submit">Save mark</button>
      </form>
      <p class="note">The form checks the mark is between 0 and 100. Chapter 3 makes Save work.</p>
    </section>
  </main>

  <footer>
    <p>Mwangaza Secondary School results system. National results: <a href="https://www.necta.go.tz">necta.go.tz</a></p>
  </footer>
</body>
</html>
```

### `web/style.css`

```css
/* Mwangaza Secondary School - results page */

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1b2435;
  background: #f4f6f8;
}

/* Header */
.site-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #1b2435;
  color: #ffffff;
}

.site-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.site-header p {
  margin: 0;
  color: #c9d1dc;
}

/* Page content */
main {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
}

section {
  background: #ffffff;
  border: 1px solid #dde2e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

h2 {
  margin-top: 0;
  font-size: 1.25rem;
}

/* The three numbers at the top */
.stats {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stats li {
  flex: 1 1 160px;
  padding: 12px;
  background: #eef8ee;
  border-radius: 6px;
}

.stats span {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e8b2a;
}

/* Results table */
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

caption {
  text-align: left;
  color: #4a5568;
  padding-bottom: 8px;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #dde2e8;
}

thead th {
  background: #1b2435;
  color: #ffffff;
}

tbody tr:nth-child(even) {
  background: #f4f6f8;
}

.num {
  text-align: right;
}

.grade {
  display: inline-block;
  min-width: 2em;
  text-align: center;
  border-radius: 4px;
  font-weight: bold;
}

.grade-a { background: #d4f0d2; color: #1d5e1a; }
.grade-b { background: #dbeafe; color: #1e4f8a; }
.grade-c { background: #fef3c7; color: #7a5200; }
.grade-d { background: #fde2cf; color: #8a3b12; }
.grade-f { background: #fde0e0; color: #9b1c1c; }

/* Mark entry form */
form {
  display: grid;
  gap: 8px;
  max-width: 320px;
}

label {
  font-weight: 600;
}

input,
select,
button {
  font: inherit;
  padding: 8px;
  border: 1px solid #b8c1cc;
  border-radius: 6px;
}

button {
  background: #2e8b2a;
  color: #ffffff;
  border: none;
  cursor: pointer;
}

button:hover {
  background: #246f21;
}

.note {
  color: #4a5568;
  font-size: 0.9rem;
}

footer {
  text-align: center;
  padding: 16px;
  color: #4a5568;
  font-size: 0.9rem;
}

/* Phones */
@media (max-width: 600px) {
  .site-header {
    padding: 12px 16px;
  }

  main {
    padding: 16px;
  }

  section {
    padding: 16px;
  }
}

/* Paper */
@media print {
  body,
  .site-header {
    background: #ffffff;
    color: #000000;
  }

  .site-header p {
    color: #000000;
  }

  .entry,
  footer {
    display: none;
  }

  section {
    border: none;
    padding: 0;
  }

  thead th {
    background: #ffffff;
    color: #000000;
    border-bottom: 2px solid #000000;
  }
}
```

### Try it yourself

1. Add a fourth subject, Kiswahili, to the table: a heading cell and one mark in every row. Recalculate each average by hand.
2. Add a sixth student. Remember to give their number, sex, marks, average and grade.
3. Change the green of the `.stats` numbers to your school's colour, and check that it is still easy to read.
4. Use the device toolbar in the developer tools to view the page at the size of a small phone. Then print it to PDF with `Ctrl + P`.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Web page | Ukurasa wa wavuti | One document on a website, written in HTML |
| Code editor | Kihariri msimbo | A program for writing code, such as VS Code |
| Element | Kipengele | One part of an HTML page, such as a heading or a table |
| Attribute | Sifa | Extra information inside an opening tag, such as `href` |
| Heading | Kichwa | A title for a page or a section |
| Link | Kiungo | Text or an image that opens another page when clicked |
| Image | Picha | A picture shown on the page |
| Table | Jedwali | Data arranged in rows and columns |
| Form | Fomu | The part of a page where visitors type or choose information |
| Stylesheet | Laha ya mitindo | A CSS file that controls how pages look |
| Colour | Rangi | Written in CSS as a hex code such as `#1b2435` |
| Layout | Mpangilio | How the parts of a page are arranged |

## Check your understanding

1. Which file — the HTML or the CSS — decides that "Mwangaza Secondary School" is the main heading, and which decides that it is white?
2. Find the mistake: `<p>Class teacher: <strong>Mwl. Grace Mushi</p></strong>`.
3. Why should every image have an `alt` attribute? Give two reasons.
4. A `label` has `for="mark"`. What must the matching `input` have, and what does the connection do for the visitor?
5. What is the difference between `.grade` and `#grade` in CSS?
6. A section has `padding: 20px`, `border: 1px solid` and `margin-bottom: 24px`. Which of these takes the section's background colour?
7. The page looks perfect on a computer, but on a phone everything is tiny. What is missing?
8. Why does the grade column show a letter as well as a colour?
9. You changed a colour in `style.css`, saved and reloaded, but nothing changed. List three things to check.

### Answers

1. The HTML decides it is the main heading (`<h1>`). The CSS decides it is white (`color: #ffffff` on `.site-header`).
2. The tags close in the wrong order. `<strong>` was opened last, so it must close first: `<p>Class teacher: <strong>Mwl. Grace Mushi</strong></p>`.
3. Screen readers read it aloud to blind visitors, and the browser shows it when the image cannot load. Search engines also use it to understand the image.
4. The `input` must have `id="mark"`. Clicking the label then puts the cursor in the box, and screen readers announce the label when the box is reached.
5. `.grade` chooses every element with `class="grade"`. `#grade` chooses the single element with `id="grade"`.
6. The padding. The margin is outside the border and shows whatever is behind the section.
7. The viewport tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
8. Some readers cannot tell certain colours apart, and a black-and-white printout loses colour completely. The letter carries the meaning; the colour only helps.
9. For example: that the CSS file is linked correctly in the `head`; that there is no missing `;` or `}` above the rule; that another rule is not winning the cascade (check **Styles** in the developer tools); and that the right file was saved.
