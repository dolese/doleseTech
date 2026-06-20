import type { SubjectContent } from "./types";

/** O-Level Biology — authored competence-based content + notes. */
export const biology: SubjectContent = {
  // ── Form I ───────────────────────────────────────────────────
  "Form I|Introduction to Biology": {
    mainCompetence: "Apply basic knowledge of biology to understand living things and their importance in daily life.",
    specificCompetences: [
      "Explain the meaning and importance of studying biology.",
      "Use laboratory apparatus and observe safety rules.",
    ],
    activities:
      "In groups, learners tour the laboratory, identify common apparatus and draw up class safety rules, then present them.",
    notes: {
      intro: "Biology is the branch of science that studies living things (organisms), their structure, functions and interactions with the environment.",
      sections: [
        {
          heading: "Importance of biology",
          points: [
            "It helps us understand our own bodies and stay healthy.",
            "It is the basis of medicine, agriculture and conservation.",
            "It explains the relationship between living things and the environment.",
          ],
        },
        {
          heading: "Laboratory safety",
          points: [
            "Follow the teacher's instructions at all times.",
            "Do not taste or smell chemicals carelessly.",
            "Report any accident immediately and keep the bench clean.",
          ],
        },
      ],
    },
  },

  "Form I|Safety in our Environment (First Aid)": {
    mainCompetence: "Apply first-aid skills to manage common accidents and emergencies safely.",
    specificCompetences: [
      "Describe the aims and rules of first aid.",
      "Give first aid for common injuries such as wounds, burns and fractures.",
    ],
    activities:
      "Learners practise basic first-aid procedures (bandaging, recovery position) using a first-aid kit and role-play.",
    notes: {
      intro: "First aid is the immediate help given to a sick or injured person before professional medical care is obtained.",
      sections: [
        {
          heading: "Aims of first aid",
          points: ["To preserve life.", "To prevent the condition from getting worse.", "To promote recovery."],
        },
        {
          heading: "Common first-aid measures",
          body: "Clean and cover wounds to stop bleeding and infection; cool burns with clean water; support and immobilise a fractured limb; place an unconscious but breathing person in the recovery position.",
        },
      ],
    },
  },

  "Form I|Health": {
    mainCompetence: "Apply knowledge of health and disease to maintain personal and community well-being.",
    specificCompetences: [
      "Explain the meaning of health and personal hygiene.",
      "Describe the causes, prevention and control of common diseases.",
    ],
    activities:
      "Learners survey common diseases in their community and prepare a health-education poster on prevention.",
    notes: {
      intro: "Health is a state of complete physical, mental and social well-being, not merely the absence of disease.",
      sections: [
        {
          heading: "Personal hygiene",
          body: "Keeping the body, clothes and surroundings clean prevents many diseases. This includes regular bathing, washing hands before eating, and proper disposal of waste.",
        },
        {
          heading: "Disease prevention",
          points: [
            "Communicable diseases spread from one person to another (e.g. cholera, malaria).",
            "Prevention includes vaccination, clean water, good sanitation and balanced diet.",
          ],
        },
      ],
    },
  },

  "Form I|Classification of Living Things": {
    mainCompetence: "Classify living things into major groups using observable features.",
    specificCompetences: [
      "Explain the need for and the basis of classification.",
      "Identify the main kingdoms of living things.",
    ],
    activities:
      "Learners collect and sort specimens by observable features and build a simple classification chart.",
    notes: {
      intro: "Classification is the arrangement of living things into groups based on their similarities and differences.",
      sections: [
        {
          heading: "Why classify?",
          body: "Classification makes the study of the huge variety of living things easier, shows relationships between organisms, and gives each a recognised scientific name.",
        },
        {
          heading: "The taxonomic hierarchy",
          body: "Organisms are grouped from the largest unit to the smallest: Kingdom, Phylum, Class, Order, Family, Genus and Species.",
        },
      ],
    },
  },

  "Form I|Cell Structure & Organisation": {
    mainCompetence: "Relate the structure of cells to their functions in living organisms.",
    specificCompetences: [
      "Describe the structure of plant and animal cells.",
      "Explain the levels of organisation from cell to organism.",
    ],
    activities:
      "Learners observe prepared cells under a microscope (or models), draw them and label the parts.",
    notes: {
      intro: "The cell is the basic structural and functional unit of all living things.",
      sections: [
        {
          heading: "Parts of a cell",
          points: [
            "Cell membrane — controls what enters and leaves the cell.",
            "Cytoplasm — where chemical reactions occur.",
            "Nucleus — controls the activities of the cell.",
            "Plant cells also have a cell wall, chloroplasts and a large vacuole.",
          ],
        },
        {
          heading: "Levels of organisation",
          body: "Cells form tissues, tissues form organs, organs form systems, and systems together make a complete organism.",
        },
      ],
    },
  },

  "Form I|Movement of Materials in & out of the Cell": {
    mainCompetence: "Relate diffusion, osmosis and active transport to processes in living organisms.",
    specificCompetences: [
      "Define diffusion, osmosis and active transport.",
      "Relate these processes to life activities such as gaseous exchange and absorption.",
    ],
    activities:
      "Learners carry out a diffusion demonstration (e.g. potassium permanganate in water) and an osmosis experiment with potato strips.",
    notes: {
      intro: "Cells exchange materials with their surroundings through the cell membrane by diffusion, osmosis and active transport.",
      sections: [
        {
          heading: "Diffusion and osmosis",
          body: "Diffusion is the movement of particles from a region of high concentration to a region of low concentration. Osmosis is the diffusion of water across a semi-permeable membrane from a dilute to a more concentrated solution.",
        },
        {
          heading: "Active transport",
          body: "Active transport moves substances against the concentration gradient and therefore requires energy. It is important for absorption of mineral salts by roots and nutrients in the gut.",
        },
      ],
    },
  },

  // ── Form II ──────────────────────────────────────────────────
  "Form II|Classification of Living Things": {
    mainCompetence: "Classify organisms within the five kingdoms using their characteristic features.",
    specificCompetences: [
      "Describe the characteristics of the five kingdoms.",
      "Identify examples of organisms in each kingdom.",
    ],
    activities:
      "Learners build a key to identify specimens and match organisms to their kingdoms.",
    notes: {
      intro: "Living things are commonly grouped into five kingdoms based on their cell type, structure and mode of nutrition.",
      sections: [
        {
          heading: "The five kingdoms",
          points: [
            "Monera — single-celled organisms without a true nucleus (bacteria).",
            "Protista — mostly single-celled with a true nucleus (amoeba).",
            "Fungi — feed by absorption (mushrooms, yeast).",
            "Plantae — make their own food by photosynthesis.",
            "Animalia — feed on other organisms.",
          ],
        },
      ],
    },
  },

  "Form II|Nutrition": {
    mainCompetence: "Relate nutrition in plants and animals to the maintenance of life.",
    specificCompetences: [
      "Explain photosynthesis as nutrition in plants.",
      "Describe a balanced diet and the process of digestion in humans.",
    ],
    activities:
      "Learners test a leaf for starch to show photosynthesis and plan a balanced daily diet using local foods.",
    notes: {
      intro: "Nutrition is the process by which organisms obtain and use food for energy, growth and repair.",
      sections: [
        {
          heading: "Photosynthesis",
          body: "Green plants make their own food using carbon dioxide and water in the presence of sunlight and chlorophyll, producing glucose and oxygen. The word equation is: carbon dioxide + water → glucose + oxygen.",
        },
        {
          heading: "Balanced diet and digestion",
          body: "A balanced diet contains carbohydrates, proteins, fats, vitamins, mineral salts, water and roughage in the right proportions. Digestion breaks down complex food into simple soluble substances that the body can absorb.",
        },
      ],
    },
  },

  "Form II|Transport of Materials in Living Things": {
    mainCompetence: "Relate transport systems to the movement of materials in plants and animals.",
    specificCompetences: [
      "Describe transport of water and food in plants.",
      "Describe the human circulatory system.",
    ],
    activities:
      "Learners place a white flower in coloured water to show transport in plants and trace the path of blood on a diagram.",
    notes: {
      intro: "Transport systems move useful materials to all parts of an organism and carry away wastes.",
      sections: [
        {
          heading: "Transport in plants",
          body: "Xylem vessels carry water and mineral salts from the roots to the leaves; phloem carries manufactured food from the leaves to other parts of the plant.",
        },
        {
          heading: "Transport in humans",
          body: "Blood is pumped by the heart through arteries, veins and capillaries. It carries oxygen, food, hormones and wastes, and helps fight disease.",
        },
      ],
    },
  },

  "Form II|Gaseous Exchange & Respiration": {
    mainCompetence: "Relate gaseous exchange and respiration to the release of energy in organisms.",
    specificCompetences: [
      "Describe gaseous exchange in plants and animals.",
      "Distinguish between aerobic and anaerobic respiration.",
    ],
    activities:
      "Learners investigate that exhaled air contains carbon dioxide using lime water and discuss respiration.",
    notes: {
      intro: "Respiration is the release of energy from food in living cells; gaseous exchange supplies the oxygen and removes the carbon dioxide involved.",
      sections: [
        {
          heading: "Gaseous exchange",
          body: "In humans, gaseous exchange occurs in the lungs (alveoli); in plants it occurs through stomata in leaves and lenticels in stems.",
        },
        {
          heading: "Aerobic and anaerobic respiration",
          points: [
            "Aerobic respiration uses oxygen and releases much energy: glucose + oxygen → carbon dioxide + water + energy.",
            "Anaerobic respiration occurs without oxygen and releases less energy (e.g. fermentation by yeast).",
          ],
        },
      ],
    },
  },

  // ── Form III ─────────────────────────────────────────────────
  "Form III|Regulation (Excretion & Homeostasis)": {
    mainCompetence: "Relate excretion and homeostasis to the maintenance of a constant internal environment.",
    specificCompetences: [
      "Describe excretion in plants and animals.",
      "Explain how the body maintains a constant internal environment.",
    ],
    activities:
      "Learners label the human urinary system and discuss how the body controls temperature and water.",
    notes: {
      intro: "Excretion is the removal of waste products of metabolism; homeostasis is the maintenance of a constant internal environment.",
      sections: [
        {
          heading: "Excretory organs",
          points: [
            "Kidneys — remove urea and excess water and salts as urine.",
            "Lungs — remove carbon dioxide and water vapour.",
            "Skin — removes excess water and salts as sweat.",
          ],
        },
        {
          heading: "Homeostasis",
          body: "The body keeps factors such as temperature, water and blood sugar within narrow limits so that cells can work efficiently.",
        },
      ],
    },
  },

  "Form III|Coordination": {
    mainCompetence: "Relate nervous and hormonal coordination to the body's response to changes.",
    specificCompetences: [
      "Describe the structure and function of the nervous system.",
      "Explain the role of hormones in coordination.",
    ],
    activities:
      "Learners demonstrate a reflex action (e.g. knee jerk) and trace the reflex arc on a diagram.",
    notes: {
      intro: "Coordination enables an organism to detect changes (stimuli) and respond appropriately. It is brought about by the nervous and endocrine systems.",
      sections: [
        {
          heading: "Nervous coordination",
          body: "The nervous system (brain, spinal cord and nerves) carries fast electrical messages. A reflex action is a rapid, automatic response that protects the body.",
        },
        {
          heading: "Hormonal coordination",
          body: "Endocrine glands release hormones into the blood to bring about slower, longer-lasting responses, e.g. insulin controls blood sugar.",
        },
      ],
    },
  },

  "Form III|Movement": {
    mainCompetence: "Relate the structure of the skeleton and muscles to movement and support.",
    specificCompetences: [
      "Describe the functions of the human skeleton.",
      "Explain how muscles and joints bring about movement.",
    ],
    activities:
      "Learners examine a model skeleton or charts, identify types of joints and demonstrate how antagonistic muscles work.",
    notes: {
      intro: "Movement is one of the characteristics of living things. In animals it depends on the skeleton, muscles and joints.",
      sections: [
        {
          heading: "Functions of the skeleton",
          points: ["Support and shape of the body.", "Protection of delicate organs.", "Provision of surfaces for muscle attachment.", "Movement at joints."],
        },
        {
          heading: "Muscles and joints",
          body: "Muscles work in antagonistic pairs: as one contracts the other relaxes, pulling bones to move at a joint, e.g. the biceps and triceps at the elbow.",
        },
      ],
    },
  },

  "Form III|Reproduction": {
    mainCompetence: "Relate reproduction to the continuity of life in plants and animals.",
    specificCompetences: [
      "Distinguish between asexual and sexual reproduction.",
      "Describe reproduction in flowering plants and in humans.",
    ],
    activities:
      "Learners dissect a flower to identify reproductive parts and discuss pollination and fertilisation.",
    notes: {
      intro: "Reproduction is the process by which living things produce new individuals of their own kind, ensuring the continuity of life.",
      sections: [
        {
          heading: "Types of reproduction",
          body: "Asexual reproduction involves one parent and produces identical offspring; sexual reproduction involves the fusion of male and female gametes and produces varied offspring.",
        },
        {
          heading: "Reproduction in plants",
          body: "In flowering plants, pollination transfers pollen to the stigma, fertilisation forms a seed, and the ovary develops into a fruit.",
        },
      ],
    },
  },

  "Form III|Growth": {
    mainCompetence: "Relate growth and development to changes in living organisms.",
    specificCompetences: [
      "Explain the meaning of growth and development.",
      "Describe the conditions necessary for growth.",
    ],
    activities:
      "Learners germinate seeds under different conditions and record growth over a week.",
    notes: {
      intro: "Growth is a permanent increase in size and mass of an organism; development is the change in form and complexity that accompanies it.",
      sections: [
        {
          heading: "Conditions for growth",
          points: ["A supply of food (nutrients).", "Water.", "Suitable temperature.", "Oxygen for respiration."],
        },
        {
          heading: "Measuring growth",
          body: "Growth can be measured by increase in height, mass or number of cells, and is often shown on a growth curve.",
        },
      ],
    },
  },

  // ── Form IV ──────────────────────────────────────────────────
  "Form IV|Genetics": {
    mainCompetence: "Apply the principles of genetics to explain inheritance of characteristics.",
    specificCompetences: [
      "Explain the basic terms used in genetics.",
      "Work out simple monohybrid crosses.",
    ],
    activities:
      "Learners use a Punnett square to predict the offspring of a monohybrid cross and discuss inherited traits.",
    notes: {
      intro: "Genetics is the study of how characteristics are passed from parents to offspring through genes.",
      sections: [
        {
          heading: "Key terms",
          points: [
            "Gene — a unit of inheritance carried on a chromosome.",
            "Dominant trait — one that shows even when only one allele is present.",
            "Recessive trait — one that shows only when both alleles are present.",
          ],
        },
        {
          heading: "Monohybrid cross",
          body: "A monohybrid cross follows the inheritance of a single characteristic. A Punnett square is used to show the possible combinations of alleles in the offspring.",
        },
      ],
    },
  },

  "Form IV|Evolution": {
    mainCompetence: "Explain evolution as the gradual change of living things over time.",
    specificCompetences: [
      "Explain the meaning of evolution and natural selection.",
      "Describe evidence that supports evolution.",
    ],
    activities:
      "Learners discuss how a given environmental change could favour certain individuals (natural selection) using examples.",
    notes: {
      intro: "Evolution is the gradual change in living organisms over a long period of time, leading to the variety of life we see today.",
      sections: [
        {
          heading: "Natural selection",
          body: "Individuals with features best suited to the environment survive and reproduce, passing on those features. Over many generations this changes the characteristics of a population.",
        },
        {
          heading: "Evidence for evolution",
          points: ["Fossils show how organisms have changed over time.", "Similarities in anatomy of related species.", "Comparative embryology and molecular evidence."],
        },
      ],
    },
  },

  "Form IV|Ecology": {
    mainCompetence: "Relate the interactions of organisms with their environment to the balance of nature.",
    specificCompetences: [
      "Explain the basic concepts and terms of ecology.",
      "Describe energy flow and nutrient cycling in an ecosystem.",
    ],
    activities:
      "Learners study a local ecosystem (e.g. a pond or garden), draw a food web and identify the trophic levels.",
    notes: {
      intro: "Ecology is the study of the relationships between living things and between them and their environment.",
      sections: [
        {
          heading: "Key terms",
          points: [
            "Habitat — the place where an organism lives.",
            "Population — organisms of the same species in an area.",
            "Ecosystem — a community of organisms together with their non-living environment.",
          ],
        },
        {
          heading: "Energy flow",
          body: "Energy flows from the sun to producers (green plants), then to consumers along a food chain. At each level much energy is lost, so food chains are usually short.",
        },
      ],
    },
  },

  "Form IV|Human Reproductive Health": {
    mainCompetence: "Apply knowledge of reproductive health to make responsible decisions.",
    specificCompetences: [
      "Describe the human reproductive system and its care.",
      "Explain the prevention of STIs including HIV/AIDS.",
    ],
    activities:
      "Learners discuss responsible behaviour and prepare key messages on preventing sexually transmitted infections.",
    notes: {
      intro: "Reproductive health means a state of well-being in all matters relating to the reproductive system at all stages of life.",
      sections: [
        {
          heading: "Care of the reproductive system",
          body: "Good hygiene, a balanced diet, regular medical check-ups and avoiding risky behaviour help maintain reproductive health.",
        },
        {
          heading: "Preventing STIs and HIV/AIDS",
          points: [
            "Abstaining from sex, or being faithful to one uninfected partner.",
            "Avoiding sharing sharp objects and unscreened blood.",
            "Seeking early treatment and counselling.",
          ],
        },
      ],
    },
  },
};
