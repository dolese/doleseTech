Every lesson in this handbook ends with something you build: a web page, a database, a script. This chapter is about protecting all of it — and protecting you. Most attacks on ordinary people are not clever. They succeed because someone clicked too quickly, reused a password, or trusted a message that looked official. The good news is that a few steady habits stop almost all of them.

By the end of this chapter you will be able to:

- recognise the common kinds of harmful software and how they reach a computer;
- spot a scam message, a fake website and a dangerous link before you act on them;
- choose passwords that are strong and still easy to remember;
- protect your mobile money, your email and your school accounts;
- keep backups so that no single mistake can destroy your work;
- know exactly what to do in the first hour after something goes wrong.

## 7.1 Why this matters

Think about what lives on your phone and computer: your mobile money, your WhatsApp conversations, photos, school work, and the accounts you use to sign in to everything else. For a teacher it may also hold students' names, marks and parents' phone numbers. Losing it is bad. Having it stolen and used against you — or against your students — is worse.

Attackers rarely choose a person because they are important. They send the same trick to thousands of people and wait for the few who fall for it. That is why you, not your antivirus, are the most important part of your security.

> **Remember:** Security is not a product you install once. It is a small set of habits you repeat every day.

## 7.2 Harmful software

*Malware* (short for "malicious software") is any program written to harm you, spy on you or take control of your device. You will hear many names for it. The table shows the ones worth knowing.

| Type | What it does | A typical example |
|---|---|---|
| Virus | Attaches itself to files and spreads when they are opened or copied | An infected document passed from computer to computer |
| Worm | Spreads across a network by itself, with no one opening anything | A whole computer lab slowing down in one afternoon |
| Trojan | Pretends to be something useful while doing harm in the background | A "free" copy of expensive software that also installs spyware |
| Ransomware | Locks your files and demands payment to unlock them | Every document renamed with a strange ending and a ransom note on the desktop |
| Spyware | Watches what you type and do, then sends it to someone else | Passwords stolen while you sign in to your email |
| Adware | Floods you with advertisements, often in new browser tabs | Pop-ups that appear even when no browser is open |

### How it gets in

Harmful software almost never "just appears". It arrives through a door that someone opened. The most common doors are:

1. **Flash drives.** A USB flash drive that has been in an infected computer — often at a printing or internet café — carries the infection to the next computer it is plugged into. The well-known "shortcut virus", which hides your folders and replaces them with shortcuts, spreads exactly this way.
2. **Cracked software.** Programs downloaded with a "crack", "patch" or "keygen" to avoid paying are one of the most reliable ways to get infected. The person who removed the licence check can add anything else they like.
3. **Attachments and links.** A file or link in an email, SMS or WhatsApp message that you were not expecting.
4. **Fake updates and fake apps.** A website announcing that "your Flash Player is out of date", or an app installed from outside the Google Play Store or Apple App Store.
5. **Old, unpatched software.** Software that has not been updated for months has known weaknesses that attackers already know how to use.

### Signs that something is wrong

- The computer or phone has suddenly become much slower, or the fan runs loudly while you are doing nothing.
- Folders on a flash drive have turned into shortcuts, or files have disappeared.
- New toolbars, home pages or programs appear that you did not install.
- Friends receive messages from you that you never sent.
- Your antivirus has been switched off and will not turn back on.
- Mobile data or airtime runs out much faster than usual.

One sign alone may have an innocent explanation. Several together deserve attention.

## 7.3 Your first line of defence

### Keep everything updated

Updates are not only new features. Most of them close security holes that attackers are actively using. Turn on automatic updates for Windows, for your phone, and for the apps you use most — especially your browser.

> **Tip:** On Windows, open **Settings → Windows Update** and check that updates are installing. Restart when asked; many updates only take effect after a restart.

### Use the antivirus you already have

Windows 10 and 11 include **Windows Security** (also called Microsoft Defender). It is free, it updates itself, and for most people it is enough. Make sure it is on:

1. Open **Start** and type **Windows Security**.
2. Choose **Virus & threat protection**.
3. Check that **Real-time protection** is on, then run a **Quick scan**.

Run a **Full scan** whenever you suspect a problem. Do not install two antivirus programs at the same time: they fight each other and make the computer slower without making it safer.

### Handle flash drives with care

- Scan a flash drive before opening its files: right-click it in File Explorer and choose **Scan with Microsoft Defender**.
- Never run a program (a file ending in `.exe`, `.bat` or `.vbs`) that you find on someone else's flash drive.
- If your folders have turned into shortcuts, do not click the shortcuts. Scan the drive first — the shortcuts usually run the virus again.

### Install software only from trusted places

Download programs from the maker's own website or from the official app store. If a paid program is too expensive, look for a free alternative instead of a cracked copy: LibreOffice instead of a pirated office suite, GIMP instead of a pirated photo editor, VS Code for programming.

> **Warning:** "Free" cracked software is paid for later — with your data, your passwords, or your files held to ransom.

## 7.4 Scams, phishing and fake messages

*Phishing* is a trick that makes you hand over information or money by pretending to be someone you trust: a bank, your mobile network, NECTA, your school, or a friend. It arrives by SMS, WhatsApp, email and phone call.

### The scams you will meet most often

**"Send it to this number."** You receive an SMS that seems to continue an earlier conversation: *"Ile hela usitume kwenye namba ile, tuma kwenye namba hii…"* ("Don't send that money to that number, send it to this one…"). There was no earlier conversation. It is sent to thousands of people in the hope that one of them is about to send money to someone.

**"I sent you money by mistake."** You receive a message that looks like a mobile money confirmation, followed by a polite request to send the money back. Check your real balance first. In most cases no money ever arrived — the "confirmation" was an ordinary SMS typed to look official.

**"Your account will be closed."** A message claims to come from your network or bank and asks you to confirm your PIN, or to read out a code that "we have just sent you". No genuine company will ever ask for your PIN or a verification code.

**"You have won."** A prize, a scholarship or a job you never applied for — but first you must pay a small "registration" or "processing" fee.

**Fake results and fake portals.** During exam season, fake websites promise early access to results or "upgraded" grades. Results are published only by NECTA, on its official website.

> **Scam alert:** Your PIN and the codes sent to your phone are like the keys to your house. Staff from M-Pesa, Mixx by Yas, Airtel Money, HaloPesa or any bank will never ask you for them — not by SMS, not by phone, not in person.

### How to check a link before you trust it

Attackers make web addresses that look almost right. Learn to read an address from the right-hand end of the domain:

| Address | Real or fake? | Why |
|---|---|---|
| `https://www.necta.go.tz/results` | Real | The domain is `necta.go.tz`. Government sites in Tanzania end in `.go.tz`. |
| `https://necta.go.tz.results-2026.com` | Fake | Everything before `.results-2026.com` is decoration. The real domain is `results-2026.com`. |
| `https://www.nectaa.go.tz` | Fake | An extra letter. Easy to miss when you read quickly. |
| `https://bit.ly/3xYz…` | Unknown | A shortened link hides where it really goes. Be careful with these from strangers. |

> **Remember:** The padlock and "https" mean only that the connection is private. They do not mean the website is honest. Fake websites use https too.

### Questions to ask before you act

1. **Was I expecting this?** Unexpected messages deserve extra suspicion.
2. **Is it trying to rush me?** "Within 24 hours", "last chance" and "your account will be blocked" are pressure tactics.
3. **Is it asking for a PIN, a code, a password or money?** Then stop.
4. **Can I check it another way?** Call the person on the number you already have for them, or open the official app or website yourself — never through the link in the message.

## 7.5 Passwords and accounts

### Make passwords long, not complicated

A password's strength comes mostly from its length. Four or five random words joined together are both strong and easy to remember:

| Password | Strength | Why |
|---|---|---|
| `Juma2007` | Very weak | A name and a birth year are the first things an attacker tries. |
| `P@ssw0rd!` | Weak | Swapping letters for symbols is a trick attackers expect. |
| `mango-river-tuesday-piano` | Strong | Long, random words, and still easy to type and remember. |

### Never reuse a password

When one website is broken into, attackers try the stolen email-and-password pairs on every other popular site. If you used the same password for your email, every account linked to that email is now at risk. Use a different password for every important account.

Remembering many passwords is hard, so let a **password manager** do it. Your browser has one built in (Google Password Manager in Chrome, for example), and Bitwarden is a respected free option. You then remember one strong password; the manager remembers the rest.

### Turn on two-step verification

*Two-step verification* asks for something extra after your password — usually a code sent to your phone or shown in an authenticator app. Even if someone learns your password, they cannot sign in without your phone. Turn it on for your email first, because your email is the key that resets every other account. Then do the same for WhatsApp (under **Settings → Account → Two-step verification**), Facebook, Instagram and your school accounts.

> **Tip:** Write down the backup codes a service gives you when you turn on two-step verification, and keep them somewhere safe at home. They get you back in if you lose your phone.

### Protect your SIM card

Your phone number receives your mobile money messages and your verification codes, which makes it valuable. In a *SIM swap*, a criminal persuades a shop to transfer your number to a new SIM card. If your phone suddenly loses network for no reason, contact your network provider immediately through its official channels. Set a PIN on your SIM card in your phone's security settings, and never share copies of your ID documents with strangers.

## 7.6 Backups: your safety net

Backups turn a disaster into an inconvenience. If your laptop is stolen, your flash drive is lost or ransomware locks your files, a recent backup means you lose an afternoon instead of a year of work.

Follow the **3-2-1 rule**:

- keep **3** copies of anything important — the original plus two backups;
- on **2** different kinds of storage — for example your laptop and an external drive;
- with **1** copy somewhere else — online (Google Drive, OneDrive) or at another place.

> **Warning:** A flash drive is not a safe place for the only copy of anything. Flash drives are easily lost, easily damaged and often infected.

Test your backup now and again by opening a file from it. A backup you have never tested is only a hope.

## 7.7 Staying private online

- **Think before you post.** Photos and posts can show your school uniform, your home, your daily route and when your house is empty. Once something is shared, you cannot fully take it back.
- **Check your privacy settings.** On WhatsApp, decide who can see your profile photo, "last seen" and status, and who can add you to groups.
- **Be careful on public Wi-Fi.** On free Wi-Fi in a café or bus station, avoid signing in to banking or mobile money. Your mobile data is safer for anything sensitive.
- **Lock your devices.** Use a PIN, pattern or fingerprint on your phone, and a password on your computer. Lock the computer when you step away: press **Win + L**.
- **Protect other people's data too.** Teachers handle students' marks, photos and phone numbers. Share them only with people who need them, and never post them in public groups.

## 7.8 If something goes wrong

Act quickly and calmly. The first hour matters most.

### If you sent money to a scammer

1. Contact your mobile money provider or bank immediately through its official customer care, and ask them to stop or reverse the transaction.
2. Keep the messages — do not delete them. Take screenshots.
3. Report the case at the nearest police station. Tanzania's Cybercrimes Act, 2015 makes online fraud a crime.

### If an account has been taken over

1. Use the service's "forgot password" option to take it back, and choose a new password you have never used before.
2. Sign out of all other devices from the account's security settings.
3. Turn on two-step verification.
4. Warn your contacts that messages sent from the account were not from you.

### If your computer is infected

1. Disconnect it from the internet.
2. Run a full scan with Windows Security.
3. Change your important passwords — from a different, clean device.
4. If the infection will not go away, back up your documents (not programs) and have the computer reinstalled by a trusted technician.

Incidents that affect many people, or organisations such as schools, can also be reported to TZ-CERT, Tanzania's national computer emergency response team, which works under the Tanzania Communications Regulatory Authority (TCRA).

## 7.9 Your security checklist

Copy this list and tick each item when it is done.

- [ ] Automatic updates are on for my computer, my phone and my browser.
- [ ] Windows Security is on and has run a scan this month.
- [ ] I scan flash drives before opening them.
- [ ] I have removed any cracked software.
- [ ] Every important account has its own password.
- [ ] My email has two-step verification turned on.
- [ ] WhatsApp has two-step verification turned on.
- [ ] My phone and computer lock with a PIN or password.
- [ ] My SIM card has a PIN.
- [ ] I have a backup of my important files in two places, and I have tested it.

## Key terms

| English | Kiswahili | Meaning |
|---|---|---|
| Malware | Programu hasidi | Software written to cause harm |
| Computer virus | Virusi vya kompyuta | Malware that spreads by attaching itself to files |
| Antivirus | Programu ya kuzuia virusi | Software that finds and removes malware |
| Update | Sasisho | A new version that fixes problems and security holes |
| Password | Nenosiri | A secret word used to prove who you are |
| Two-step verification | Uthibitisho wa hatua mbili | A second check, such as a code, after your password |
| Scam | Utapeli | A trick to steal money or information |
| Hacker | Mdukuzi | A person who breaks into computers or accounts |
| Backup | Nakala rudufu | An extra copy of your files kept somewhere safe |
| Link | Kiungo | A clickable address that opens a web page |

## Check your understanding

1. A friend gives you a flash drive at the internet café. What should you do before opening the files on it?
2. Why is `mango-river-tuesday-piano` a stronger password than `P@ssw0rd!`?
3. You receive an SMS: *"Tumekutumia TZS 50,000 kimakosa. Tafadhali rudisha kwenye namba hii."* ("We sent you TZS 50,000 by mistake. Please return it to this number.") What do you check first?
4. Which part of `https://necta.go.tz.results-2026.com` is the real domain, and is the site official?
5. Why should you turn on two-step verification for your email before any other account?
6. Explain the 3-2-1 backup rule in your own words.
7. Your phone suddenly shows "No service" while everyone around you has signal. What could be happening, and what should you do?

### Answers

1. Scan it with Windows Security (right-click → **Scan with Microsoft Defender**), and do not run any programs found on it.
2. It is much longer. Length makes a password hard to guess, and letter-to-symbol swaps such as `@` for `a` are tricks attackers already try.
3. Check your real mobile money balance in the official menu or app. Do not trust the SMS — a fake confirmation is just a typed message.
4. The real domain is `results-2026.com`, read from the right-hand end. It is not official; NECTA's own site is `necta.go.tz`.
5. Email is used to reset the passwords of almost every other account. Whoever controls your email can take over the rest.
6. Keep three copies of important files, on two different kinds of storage, with one copy kept somewhere else (online or at another location).
7. It could be a SIM swap. Contact your network provider immediately through its official channels and check your mobile money account.
