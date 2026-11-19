
export const learningModules = [
  {
    id: "programming-basics",
    title: "Programming Fundamentals",
    category: "Programming",
    level: "Beginner",
    duration: "30 minutes",
    description:
      "Understand programming concepts, variables, conditions and loops.",

    objectives: [
      "Understand what a programming language is.",
      "Identify variables and common data types.",
      "Understand conditional statements.",
      "Explain how loops work."
    ],

    lessons: [
      {
        title: "Introduction to Programming",
        content:
          "Programming is the process of writing instructions that tell a computer what to do. These instructions are written using programming languages such as Python, JavaScript and C#.",
        example:
          "Think of a recipe. Each step tells you what to do in a particular order. A computer program works in a similar way."
      },
      {
        title: "Variables and Data Types",
        content:
          "A variable is a named storage location used to hold data. Common data types include integers, decimal numbers, strings and Boolean values.",
        example:
          'For example, age = 20 stores an integer, while name = "Alex" stores text.'
      },
      {
        title: "Conditions and Loops",
        content:
          "Conditional statements allow a program to make decisions. Loops allow a program to repeat a block of instructions.",
        example:
          "An if statement can check whether a student passed an exam. A loop can repeat an action for every student in a class."
      }
    ],

    quiz: {
      question:
        "Which programming structure is used to repeat instructions?",
      options: ["Variable", "Loop", "String", "Boolean"],
      answer: "Loop",
      explanation:
        "A loop repeats a block of instructions while a condition is satisfied or for a specified number of iterations."
    }
  },

  {
    id: "web-development",
    title: "Web Development Essentials",
    category: "Web Development",
    level: "Beginner",
    duration: "35 minutes",
    description:
      "Learn the roles of HTML, CSS and JavaScript in modern websites.",

    objectives: [
      "Understand the structure of a webpage.",
      "Explain the purpose of CSS.",
      "Understand JavaScript interactions.",
      "Identify how frontend technologies work together."
    ],

    lessons: [
      {
        title: "HTML Structure",
        content:
          "HTML defines the structure and content of a webpage. It uses elements such as headings, paragraphs, images and links.",
        example:
          "A heading element displays a title, while a paragraph element displays a block of text."
      },
      {
        title: "CSS Styling",
        content:
          "CSS controls the appearance of a webpage, including colours, fonts, spacing, layouts and responsive design.",
        example:
          "You can use CSS to change a heading's colour, increase its size or centre it on the page."
      },
      {
        title: "JavaScript",
        content:
          "JavaScript adds behaviour and interactivity to websites. It can respond to user actions, update content and communicate with APIs.",
        example:
          "A button that displays a message when clicked is a simple example of JavaScript interaction."
      }
    ],

    quiz: {
      question:
        "Which technology is mainly responsible for styling a webpage?",
      options: ["HTML", "CSS", "SQL", "Python"],
      answer: "CSS",
      explanation:
        "CSS controls the visual presentation of a webpage, including colours, spacing and layout."
    }
  },

  {
    id: "artificial-intelligence",
    title: "Introduction to Artificial Intelligence",
    category: "Artificial Intelligence",
    level: "Intermediate",
    duration: "40 minutes",
    description:
      "Explore AI, machine learning and how intelligent systems learn from data.",

    objectives: [
      "Define artificial intelligence.",
      "Understand machine learning.",
      "Identify supervised and unsupervised learning.",
      "Recognise real-world AI applications."
    ],

    lessons: [
      {
        title: "What is Artificial Intelligence?",
        content:
          "Artificial Intelligence is a field of computing focused on building systems that perform tasks commonly associated with human intelligence, such as reasoning, prediction and language understanding.",
        example:
          "Voice assistants, recommendation systems and image recognition tools are examples of AI applications."
      },
      {
        title: "Machine Learning",
        content:
          "Machine learning is a branch of AI in which systems learn patterns from data to make predictions or decisions.",
        example:
          "An email filter can learn from examples of spam and non-spam messages to classify future emails."
      },
      {
        title: "Learning Approaches",
        content:
          "Supervised learning uses labelled examples. Unsupervised learning identifies patterns in data without labelled outcomes.",
        example:
          "Predicting house prices from historical labelled data is supervised learning. Grouping customers by purchasing behaviour is an example of unsupervised learning."
      }
    ],

    quiz: {
      question:
        "Which learning approach uses labelled training data?",
      options: [
        "Supervised learning",
        "Unsupervised learning",
        "Random search",
        "Manual programming only"
      ],
      answer: "Supervised learning",
      explanation:
        "Supervised learning trains a model using examples that include known input and output labels."
    }
  }
];

const STORAGE_KEY = "devdeakin_learning_progress";

export function getLearningProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Could not load learning progress:", error);
    return {};
  }
}

export function saveLearningProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Could not save learning progress:", error);
  }
}
