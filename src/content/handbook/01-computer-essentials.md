Before you write a web page or a line of Python, you need to be comfortable with the machine itself: where your files are, how to move around quickly, which symbols are which on the keyboard, and what actually happens when you open a website. None of this is difficult, but people who skip it spend years losing files and hunting for keys. This chapter gives you the foundation every later chapter stands on.

By the end of this chapter you will be able to:

- name the main parts of a computer and say what each one does;
- organise your work in folders and always know where a file was saved;
- read a file path and a file extension, and know why they matter;
- use the keyboard shortcuts that save the most time;
- find and name every symbol a programmer types;
- explain in plain words how a web page travels from a server to your screen;
- set up the folder for the project you will build through this book.

## 1.1 What is inside a computer

Every computer — a laptop, a desktop in the school office, or the phone in your pocket — is made of two things. *Hardware* is the part you can touch: the screen, the keyboard, the chips inside. *Software* is the set of instructions that tells the hardware what to do: Windows, Android, Microsoft Word, WhatsApp, and the programs you will write in this book.

The table shows the hardware parts that matter most when you choose, use or repair a computer.

| Part | What it does | What to look for |
|---|---|---|
| Processor (CPU) | Carries out instructions — the "brain" of the computer | Newer generations are faster; Intel Core i3/i5 or AMD Ryzen 3/5 are fine for learning |
| Memory (RAM) | Holds the programs and files you are using right now; emptied when the power goes off | 8 GB is comfortable for programming; 4 GB works but feels slow |
| Storage (SSD or hard disk) | Keeps your files and programs when the power is off | An SSD starts the computer and opens programs several times faster than an old hard disk |
| Screen | Shows output | A larger screen makes it easier to see code and a browser side by side |
| Keyboard and mouse | Input: how you give the computer instructions | A full keyboard with arrow keys is easier for programming |
| Battery | Keeps a laptop running without mains power | Important where power cuts are common |

A useful way to remember the difference between memory and storage: **memory is your desk, storage is your cupboard.** You take a file out of the cupboard and put it on the desk to work on it. The desk is fast but small, and it is cleared every evening. Anything you want to keep must go back into the cupboard — which is exactly what **Save** does.

> **Remember:** If the power goes off before you save, the changes on your "desk" are lost. Save early and save often: `Ctrl + S`.

### The operating system

The *operating system* is the software that runs everything else. It starts the computer, manages files, and lets programs share the screen, the keyboard and the internet connection. Most computers in Tanzanian schools and offices run **Windows**; most phones run **Android**. Many servers on the internet — including the ones that will host your web pages — run **Linux**. The ideas in this book work on all of them, and where the steps differ we show the Windows way first.

## 1.2 Files and folders

A *file* is one saved piece of work: a letter, a photo, a spreadsheet of marks, a page of code. A *folder* is a container that holds files and other folders. Good folders are the difference between finding last term's marks in ten seconds and never finding them at all.

### Organise by purpose, not by date

Decide on a small number of top-level folders and keep to them. A teacher's Documents folder might look like this:

```text
Documents
├── School
│   ├── 2026
│   │   ├── Form 2 Biology
│   │   │   ├── Schemes of work
│   │   │   ├── Tests
│   │   │   └── Marks
│   │   └── Form 4 Biology
│   └── Staff meetings
├── Personal
└── Projects
    └── results-system
```

Each folder answers one question: *which year? which class? what kind of document?* When you save a file, you already know where it belongs.

### Naming files well

A good file name tells you what is inside without opening it.

| Poor name | Better name | Why |
|---|---|---|
| `New Document (3).docx` | `form-2-biology-test-march-2026.docx` | Says the class, subject, kind of document and date |
| `final FINAL 2.xlsx` | `form-4-marks-term-1-v2.xlsx` | A version number instead of "final" — there is always another final |
| `IMG_20260314_0915.jpg` | `science-fair-2026-poster.jpg` | Rename photos you plan to use |
| `my page.html` | `results.html` | Web files work best with no spaces |

For anything you will use on the web or in code — and that is most of this book — follow three rules: use **lowercase letters**, use **hyphens instead of spaces**, and avoid symbols such as `#`, `&`, `?` and `%`. A space in a web address becomes `%20`, and a `#` or `?` changes the meaning of the address completely.

### File extensions

The letters after the last dot in a file name are its *extension*. The extension tells the computer which program should open the file.

| Extension | Kind of file | Opens with |
|---|---|---|
| `.docx` | Word document | Microsoft Word, LibreOffice Writer |
| `.xlsx` | Spreadsheet | Microsoft Excel, LibreOffice Calc |
| `.pdf` | Document that looks the same everywhere | A browser, or any PDF reader |
| `.jpg`, `.png` | Picture | Photos, any browser |
| `.txt` | Plain text with no formatting | Notepad, any code editor |
| `.html`, `.css`, `.js` | Web page, its styles, its JavaScript | A browser to view; a code editor to change |
| `.py` | Python program | Python; a code editor to change |
| `.cpp` | C++ program | A C++ compiler; a code editor to change |
| `.sql` | Database commands | A database tool |
| `.exe` | Windows program that runs when opened | Windows itself — **be careful** |
| `.zip` | Several files packed into one | Windows Explorer, 7-Zip |

Windows hides extensions by default, which causes two problems. You cannot tell `results.html` from `results.html.txt`, so a web page you wrote in Notepad refuses to open in the browser. And a harmful program called `photo.jpg.exe` appears on screen as `photo.jpg`. Turn extensions on now; you will need them for every chapter that follows.

> **Tip:** In File Explorer, open the **View** menu and tick **File name extensions**. On Windows 11 it is under **View → Show → File name extensions**.

### Paths

Every file has an address called its *path*: the drive, then each folder in turn, then the file name. On Windows the parts are separated by a backslash `\`:

```text
C:\Users\Amina\Documents\School\2026\Form 2 Biology\Marks\term-1.xlsx
```

Read it from left to right: drive `C:`, then the folder `Users`, then `Amina`, and so on, down to the file `term-1.xlsx`. Web addresses and Linux computers use a forward slash `/` instead, and so does most code — even on Windows:

```text
https://example.com/school/2026/results.html
```

You can copy the full path of any file in File Explorer: hold `Shift`, right-click the file and choose **Copy as path**.

### Where did it save?

The most common computer problem is not a virus — it is a file saved "somewhere". Three habits prevent it:

1. **Read the Save dialog before you click Save.** The box at the top shows which folder you are in. Change it if it is wrong.
2. **Check Downloads.** Files from the internet, email and WhatsApp Web go to the Downloads folder unless you choose otherwise. Move them to the right folder the same day.
3. **Use search.** Press the `Windows` key and start typing part of the file name. In File Explorer, the search box at the top right searches the folder you are in and everything inside it.

## 1.3 Keyboard shortcuts

A shortcut is a combination of keys that does a job without the mouse. You hold the first key — usually `Ctrl` — and tap the second. People who use shortcuts are not showing off; they are simply faster, and their hands stay on the keyboard while they type code.

You do not need to learn every shortcut at once. Learn the first table this week, and add a few from the others each week.

### The ones you will use every day

These work in almost every program on Windows: Word, Excel, browsers and code editors.

| Shortcut | What it does |
|---|---|
| `Ctrl + C` | Copy the selected text or file |
| `Ctrl + X` | Cut — copy it and remove it from here |
| `Ctrl + V` | Paste what you copied or cut |
| `Ctrl + Z` | Undo the last change — press again to go further back |
| `Ctrl + Y` | Redo what you just undid |
| `Ctrl + S` | Save |
| `Ctrl + A` | Select everything |
| `Ctrl + F` | Find a word on the page or in the document |
| `Ctrl + P` | Print |

On a Mac, use the `Cmd` key wherever these tables say `Ctrl`.

### Moving around Windows

| Shortcut | What it does |
|---|---|
| `Alt + Tab` | Switch between open windows — keep holding `Alt` and tap `Tab` to choose |
| `Windows + E` | Open File Explorer |
| `Windows + D` | Show the desktop; press again to bring the windows back |
| `Windows + L` | Lock the computer — do it every time you walk away |
| `Windows + V` | Clipboard history: paste something you copied earlier, not just the last thing (turn it on the first time) |
| `Windows + Shift + S` | Take a screenshot of part of the screen |
| `Windows + ←` / `→` | Snap a window to the left or right half of the screen |
| `Ctrl + Shift + Esc` | Open Task Manager, to close a program that has stopped responding |
| `F2` | Rename the selected file |

> **Tip:** `Windows + ←` and `Windows + →` are perfect for programming: put your code editor on one half of the screen and the browser showing your page on the other.

### In the browser

| Shortcut | What it does |
|---|---|
| `Ctrl + T` | Open a new tab |
| `Ctrl + W` | Close the current tab |
| `Ctrl + Shift + T` | Reopen the tab you closed by mistake |
| `Ctrl + L` | Jump to the address bar, ready to type |
| `Ctrl + R` or `F5` | Reload the page — you will do this after every change to your web pages |
| `Ctrl + +` / `Ctrl + -` | Make the page bigger or smaller; `Ctrl + 0` resets it |
| `F12` | Open the developer tools, which you will use from Chapter 2 |

### When editing text

| Shortcut | What it does |
|---|---|
| `Ctrl + ←` / `→` | Move the cursor one whole word left or right |
| `Home` / `End` | Jump to the start or end of the line |
| `Shift + arrow keys` | Select text as you move |
| `Ctrl + Shift + ←` / `→` | Select whole words at a time |
| `Ctrl + Backspace` | Delete the whole word before the cursor |
| `Ctrl + Home` / `Ctrl + End` | Jump to the very start or very end of the document |

## 1.4 The symbols programmers type

Code uses symbols that you rarely type in an ordinary letter. Many beginners lose time searching the keyboard for them, or mix up two that look alike. Learn their names: when someone says "put it in curly braces", you should know at once which keys to press.

The table is for the standard US keyboard layout, which almost every computer sold in Tanzania uses.

| Symbol | Name | How to type it | Where you will meet it |
|---|---|---|---|
| `( )` | Parentheses, round brackets | `Shift + 9`, `Shift + 0` | Every language: `print("Habari")` |
| `[ ]` | Square brackets | The keys to the right of `P` | Lists in Python and JavaScript |
| `{ }` | Curly braces | `Shift` + the keys to the right of `P` | CSS rules; blocks in JavaScript and C++ |
| `< >` | Angle brackets, less than / greater than | `Shift + ,` and `Shift + .` | HTML tags; comparisons such as `marks > 40` |
| `;` | Semicolon | The key to the right of `L` | Ends a statement in JavaScript, C++, SQL and CSS |
| `:` | Colon | `Shift + ;` | CSS properties; Python `if` and `for` lines |
| `"` `'` | Double and single quotes | The key to the left of `Enter` | Around text: `"Dodoma"` |
| `` ` `` | Backtick | The key to the left of `1` | JavaScript template text; Markdown code |
| `~` | Tilde | `Shift` + the backtick key | Your home folder in a terminal |
| `/` | Forward slash | The key to the left of right `Shift` | Web addresses; division; comments `//` |
| `\` | Backslash | The key above `Enter` | Windows paths; special characters such as `\n` |
| `\|` | Vertical bar, pipe | `Shift + \` | "Or" in code: `\|\|`; tables in Markdown |
| `_` | Underscore | `Shift + -` | Names in Python and SQL: `student_name` |
| `-` | Hyphen, minus | The key to the right of `0` | Subtraction; file names for the web |
| `=` | Equals sign | The key to the left of `Backspace` | Gives a value: `total = 0` |
| `==` | Double equals | Press `=` twice | Asks "are these equal?" — not the same as `=` |
| `#` | Hash | `Shift + 3` | Python comments; CSS ids; Markdown headings |
| `%` | Percent | `Shift + 5` | The remainder after division: `7 % 2` is `1` |
| `&` | Ampersand | `Shift + 7` | "And" in code: `&&` |
| `!` | Exclamation mark | `Shift + 1` | "Not" in code: `!=` means "is not equal to" |
| `*` | Asterisk, star | `Shift + 8` | Multiplication; "everything" in SQL |
| `^` | Caret | `Shift + 6` | Rarely; it does *not* mean "to the power of" in most languages |
| `@` | At sign | `Shift + 2` | Email addresses; CSS rules such as `@media` |
| `$` | Dollar sign | `Shift + 4` | Inside JavaScript template text: `${name}` |

### Pairs that are easy to confuse

- **`/` and `\`.** The forward slash leans forward like a runner; the backslash leans back. Web addresses only ever use `/`.
- **`=` and `==`.** One equals sign *puts* a value into a name. Two *compare* two values. Mixing them up is one of the most common beginner mistakes in every language.
- **`0` and `O`, `1` and `l`.** The digit zero and the capital letter O look alike in many fonts, as do the digit one and a lowercase L. Code editors use fonts that make them different — look closely when you copy code.
- **Straight and curly quotes.** Word processors change `"` into `“` and `”` as you type. Code needs the straight ones. If you copy code from a Word document or a PDF and it fails for no reason, the quotes are the first thing to check.

> **Warning:** Never write code in Microsoft Word. It changes quotes, joins lines and adds hidden formatting. Use a code editor such as Visual Studio Code, which Chapter 2 helps you install, or Notepad if you have nothing else.

## 1.5 Typing well

You will type a lot of code. If you look at the keyboard for every letter, each line takes three times as long and you make more mistakes. Ten minutes of touch-typing practice a day for a month is one of the best investments a new programmer can make.

- Rest your fingers on the **home row**: left hand on `A S D F`, right hand on `J K L ;`. The small bumps on `F` and `J` let you find them without looking.
- Each finger is responsible for the keys above and below its home key.
- Use free practice websites such as typing.com or keybr.com. Aim for accuracy first; speed follows.
- Learn where the programmer's symbols are from the table above, and practise typing lines of real code, not just sentences.

## 1.6 How the internet works

You use the internet every day, but programmers need to know what happens underneath. When you understand the journey of a web page, error messages stop being mysterious, and Chapters 2 to 4 make much more sense.

### Clients and servers

The internet is a huge network of computers connected to each other. Most of them play one of two roles:

- A *client* asks for something. Your browser — Chrome, Edge, Firefox, Safari — is a client.
- A *server* answers. It is a computer, usually in a data centre, that stores websites and sends them to anyone who asks.

Every time you open a page, your browser sends a *request* to a server, and the server sends back a *response*: the page itself, its pictures, its styles and its scripts.

### Addresses: IP addresses and domain names

Every device on the internet has a number called an *IP address*, such as `203.0.113.10`. Numbers like that are hard to remember, so we give servers names instead: `example.com`, `necta.go.tz`, `wikipedia.org`. These names are *domain names*.

When you type a domain name, your device first asks a *DNS server* — the internet's phone book — which IP address belongs to that name. Only then does your browser contact the right server. If DNS fails, you see an error such as "This site can't be reached" even though your internet connection is working.

### The parts of a web address

A web address is called a *URL*. Each part has a job.

```text
https://shule.example.co.tz/results/form-4?year=2026#mathematics
```

| Part | In the example | What it means |
|---|---|---|
| Protocol | `https://` | How to talk to the server. The `s` means *secure*: the connection is encrypted |
| Subdomain | `shule.` | A section of a larger site, chosen by the owner of the domain |
| Domain | `example.co.tz` | The name the owner registered. Read it from the right: `.tz` is Tanzania, `.co.tz` is a company in Tanzania |
| Path | `/results/form-4` | Which page on the site — like a file path, with forward slashes |
| Query | `?year=2026` | Extra information sent to the server, as `name=value` pairs |
| Fragment | `#mathematics` | A place on the page to jump to; it is not sent to the server |

Chapter 7 shows how attackers abuse these parts to make fake addresses look real. The rule from that chapter is worth repeating here: the domain is the part just before the first single `/`, read from the right-hand end.

### HTTP and HTTPS

The language browsers and servers use to talk to each other is *HTTP*. *HTTPS* is the same language inside an encrypted connection, so that no one in between — on the café Wi-Fi, or at your internet provider — can read or change what you send and receive. Every website that asks for a password or a payment must use HTTPS, and today almost all websites do.

### What the server answers

Every response starts with a three-digit *status code* that says how the request went. You will see these often once you build your own sites.

| Code | Meaning | When you see it |
|---|---|---|
| `200` | OK | Everything worked — you never notice this one |
| `301` | Moved permanently | The page has a new address; the browser follows it automatically |
| `404` | Not found | The address is wrong, or the page was removed |
| `403` | Forbidden | The page exists but you are not allowed to see it |
| `500` | Server error | Something broke on the server — not your fault as a visitor |
| `503` | Service unavailable | The server is overloaded or down for maintenance |

Codes that start with `4` mean the request had a problem; codes that start with `5` mean the server had a problem. When you build pages in Chapter 2 and see a `404`, check the spelling of the file name and the folder it is in.

### The journey of one page

Put together, opening `https://example.com/results.html` goes like this:

1. You type the address and press `Enter`.
2. Your device asks DNS for the IP address of `example.com`.
3. Your browser opens a secure connection to that server.
4. It sends a request: *"Please send me `/results.html`."*
5. The server finds the file and replies `200 OK` with the HTML.
6. The browser reads the HTML, sees that the page also needs a stylesheet, some images and a script, and requests each of them the same way.
7. It draws the finished page on your screen.

All of this usually takes less than a second. In Chapter 2 you will write the HTML from step 5 yourself.

## 1.7 Data: bytes, bundles and saving

Everything a computer stores or sends is measured in *bytes*. One byte holds about one letter of text. Larger amounts use the units in the table; each is about a thousand times the one before.

| Unit | Size | Roughly how much |
|---|---|---|
| Byte (B) | — | One letter |
| Kilobyte (KB) | About 1,000 bytes | A short SMS conversation; a small HTML page |
| Megabyte (MB) | About 1,000 KB | One photo from a phone (2–5 MB); one song (3–5 MB) |
| Gigabyte (GB) | About 1,000 MB | A typical data bundle; about an hour of video at standard quality |
| Terabyte (TB) | About 1,000 GB | A large external hard disk |

You will sometimes see 1,024 used instead of 1,000. Both are in use; the difference does not matter for everyday decisions.

The same units explain your data bundle. Pages that are mostly text cost very little. Video and automatic updates are what empty a bundle quickly. To make a bundle last:

- download large files and updates on Wi-Fi when you can;
- in your phone's settings, set app updates to install on Wi-Fi only;
- lower the video quality in YouTube and similar apps;
- watch for apps that use data in the background — Android shows data use per app under **Settings → Network → Data usage** (the exact names differ between phones).

> **Tip:** When you build web pages, remember that many of your visitors pay for every megabyte. A page that loads 10 MB of large photos is expensive to open on a phone. Chapter 2 shows how to keep pages small.

## 1.8 Set up your project folder

Throughout this book you will build one project, step by step: a small *school results system* that stores students, subjects and marks, works out grades and divisions, and shows the results on a web page. Each chapter adds a piece.

Create its folder now, so that every file has a home from the first day:

1. Open File Explorer (`Windows + E`) and go to **Documents**.
2. Create a folder called `Projects` if you do not have one: right-click an empty area, choose **New → Folder**, type the name and press `Enter`.
3. Inside `Projects`, create a folder called `results-system` — lowercase, with a hyphen, no spaces.
4. Inside `results-system`, create these folders:

```text
results-system
├── web        (Chapters 2 and 3: HTML, CSS and JavaScript)
├── database   (Chapter 4: SQL)
├── python     (Chapter 5)
└── cpp        (Chapter 6)
```

5. Click once in the address bar at the top of the `results-system` window to see its full path, and write it down. You will need it when you open the project in your code editor.

In Chapter 8 you will put this whole folder under version control with Git, so that every change is saved and nothing you build can be lost.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Hardware | Maunzi | The physical parts of a computer |
| Software | Programu | Instructions that tell the hardware what to do |
| Operating system | Mfumo wa uendeshaji | The software that runs the computer and all other programs |
| Memory (RAM) | Kumbukumbu | Fast, temporary space for the work you are doing now |
| Storage | Hifadhi | Where files are kept when the power is off |
| File | Faili | One saved piece of work |
| Folder | Kabrasha (folda) | A container for files and other folders |
| Keyboard | Kibodi | The keys you type with |
| Shortcut | Njia ya mkato | A key combination that does a job without the mouse |
| Browser | Kivinjari | The program you use to open websites |
| Website | Tovuti | A collection of web pages under one domain name |
| Server | Seva | A computer that stores websites and answers requests |
| Download | Pakua | Copy a file from the internet to your device |
| Upload | Pakia | Copy a file from your device to the internet |

## Check your understanding

1. You were typing a report when the power went off, and the changes are gone. Using the "desk and cupboard" idea, explain what happened and how to prevent it.
2. A student says their web page `index.html` will not open in the browser, and Notepad shows it was saved as a text file. What is the most likely problem, and what setting would have made it obvious?
3. Write a better name for a file called `Copy of marks NEW (2).xlsx` that holds Form 3 Chemistry marks for Term 2 of 2026.
4. What is the difference between `total = 50` and `total == 50`?
5. Name the symbols `{ }`, `[ ]` and `\`, and give one place each is used.
6. In `https://maktaba.example.ac.tz/books?subject=history#top`, which part is the domain, which is the path, and which is the query?
7. You open a page and see `404`. Is the problem more likely with the address you typed or with the server? What about `500`?
8. Why does watching videos use far more of a data bundle than reading news websites?

### Answers

1. Unsaved changes are kept only in memory — the "desk" — which is cleared when the power goes off. Only what was saved to storage — the "cupboard" — survives. Press `Ctrl + S` often.
2. It was probably saved as `index.html.txt`. Turning on **File name extensions** in File Explorer would have shown the hidden `.txt`. In Notepad, choose **Save as type: All files** and type the full name `index.html`.
3. For example, `form-3-chemistry-marks-term-2-2026.xlsx`.
4. `total = 50` puts the value 50 into `total`. `total == 50` asks whether `total` is equal to 50, and gives true or false.
5. `{ }` are curly braces, used for CSS rules and code blocks in JavaScript and C++. `[ ]` are square brackets, used for lists in Python and JavaScript. `\` is a backslash, used in Windows paths.
6. The domain is `example.ac.tz` (with `maktaba` as its subdomain), the path is `/books`, and the query is `?subject=history`. `#top` is the fragment.
7. A `404` usually means the address is wrong or the page no longer exists. A `500` means something went wrong on the server.
8. Video sends many pictures every second, which adds up to hundreds of megabytes an hour. A news page is mostly text, which is very small.
