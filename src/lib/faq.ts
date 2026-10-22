/**
 * Questions teachers ask, shown on /faq and, a few of them, on /exams.
 *
 * Answers must stay true of the site as it runs: the prices group changes
 * with whether papers are sold yet (see sellingEnabled in entitlements.ts).
 */
import { FREE_PAPERS_PER_MONTH, formatTzs, getProduct } from "./catalog";

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: Faq[];
}

const papers = getProduct("papers-10");

const COMPOSER: Faq[] = [
  {
    id: "what",
    q: "What is the Exams Composer?",
    a: "It sets complete exam papers for Tanzanian secondary schools: 22 O-Level and A-Level subjects, from a quick quiz to a final examination, in English or Kiswahili. Every paper comes with its marking scheme.",
  },
  {
    id: "how",
    q: "How is a paper made?",
    a: "The way an examination panel works. First a plan, the table of specifications: for terminal, mock, pre-national and final papers it follows the official NECTA layout for the subject. You check and change the plan before anything is written. Then one examiner writes the questions to the plan, a second answers the paper without seeing the marking scheme, a chief examiner moderates every question against a nine-point checklist, and questions that fall short are rewritten and checked again, at most twice. Last, the totals, numbering and answer key are checked.",
  },
  {
    id: "time",
    q: "How long does a paper take?",
    a: "The plan is ready at once. Writing and checking usually takes two to five minutes. You can close the page while it works: the paper waits under My papers on the same device, and if you give an email address we send you a link when it is ready.",
  },
  {
    id: "necta",
    q: "Are the papers approved by NECTA?",
    a: "No. Dolese Tech is not part of NECTA or TIE. Papers follow the published NECTA formats and the TIE syllabus, but they are written and checked by AI, so read every paper before you use it. The examiner's report that comes with each paper lists anything the panel could not settle.",
  },
  {
    id: "edit",
    q: "Can I change a paper?",
    a: "Yes. Change the topics, thinking levels, difficulty or marks in the plan before it is written. Afterwards you can replace any single question, have the whole paper rewritten with an instruction such as \"use farming examples\", or download it as a Word document and edit it yourself.",
  },
  {
    id: "download",
    q: "What can I download?",
    a: "An editable Word document with the marking scheme, or print and save as PDF from your browser. For exam security you can download shuffled versions A to D and add a watermark such as your school name and term.",
  },
  {
    id: "model",
    q: "Which AI writes the papers?",
    a: "Claude, by Anthropic, unless you pick another model in the settings; Google's Gemini models are offered too.",
  },
];

function prices(selling: boolean): Faq[] {
  if (!selling) {
    return [
      {
        id: "free",
        q: "Is it free?",
        a: "Yes, while the Exams Composer is in its pilot, and no account is needed. There is an hourly limit for each visitor so that every teacher gets a turn.",
      },
      {
        id: "later",
        q: "Will it stay free?",
        a: `When teacher accounts open, every account will include ${FREE_PAPERS_PER_MONTH} free papers a month, and more papers can be bought by mobile money. Planning a paper will always be free.`,
      },
    ];
  }
  return [
    {
      id: "free",
      q: "Is it free?",
      a: `Every free account gets ${FREE_PAPERS_PER_MONTH} papers a month. After that${papers ? `, ${papers.name} cost ${formatTzs(papers.price)} and never expire` : ", you can buy more papers"}. Planning a paper is always free; a paper is counted when you approve the plan.`,
    },
    {
      id: "pay",
      q: "How do I pay?",
      a: "By mobile money: M-Pesa, Mixx by Yas, Airtel Money or HaloPesa. Enter your number and press Pay; a prompt appears on that phone, and you approve it with your PIN.",
    },
    {
      id: "failed",
      q: "What if a paper cannot be written?",
      a: "Then it is not counted. If the panel cannot finish a paper, the paper goes back to your allowance by itself.",
    },
    {
      id: "packs",
      q: "What are subject packs?",
      a: "Every week of the scheme of work, all lesson plans and lesson notes for one subject, for one school term: Term 1 is January to June and Term 2 is July to December. A pack bought in June or December is for the next term, and you can use it straight away.",
    },
  ];
}

const PRIVACY: Faq[] = [
  {
    id: "who-sees",
    q: "Who can see my papers?",
    a: "Papers you save are kept in your own browser, on your device. A paper the panel is writing is kept on our server for 30 days and opens only with its private link, which only you receive. Keep that link to yourself until the exam is over.",
  },
  {
    id: "email",
    q: "What happens to my email address?",
    a: "It is used once, to tell you your paper is ready, and deleted as soon as that email is sent.",
  },
  {
    id: "ai-data",
    q: "What is sent to the AI?",
    a: "The paper's settings and plan, including the school name if you give one, go to the AI provider so it can write the paper. Never put students' names or other personal details in an instruction.",
  },
];

export function faqGroups(selling: boolean): FaqGroup[] {
  return [
    { title: "The Exams Composer", items: COMPOSER },
    { title: selling ? "Accounts and prices" : "Price", items: prices(selling) },
    { title: "Privacy and your papers", items: PRIVACY },
  ];
}

/** The few questions worth answering on the product page itself. */
export function topQuestions(selling: boolean): Faq[] {
  const all = faqGroups(selling).flatMap((g) => g.items);
  return ["how", "time", "necta", "free"].map((id) => all.find((f) => f.id === id)!).filter(Boolean);
}
