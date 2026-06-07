const getFallbackQuestions = (role, experience, topics) => {
  const normalizedRole = (role || "").toLowerCase();
  const normalizedTopics = (topics || "").toLowerCase();

  const bank = {
    react: [
      {
        question: "Explain the difference between functional components and class components in React. Why did React introduce hooks?",
        answer: "Functional components are simpler JavaScript functions that accept props and return JSX. Class components are ES6 classes that extend React.Component and maintain state/lifecycle methods. Hooks were introduced in React 16.8 to allow functional components to use state and other React features without writing class components, making code more readable, reusable, and easier to test."
      },
      {
        question: "What is the Virtual DOM, and how does React's reconciliation process work?",
        answer: "The Virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous one (diffing), and calculates the most efficient way to update the real DOM (reconciliation). This minimizes expensive direct DOM manipulations, boosting performance."
      },
      {
        question: "Explain the purpose of React.memo, useMemo, and useCallback. How do they differ?",
        answer: "React.memo is a higher-order component that memoizes functional components to prevent re-renders unless props change. useMemo memoizes the computed value of an expensive calculation. useCallback memoizes the callback function itself to prevent recreation on every render. All three optimize performance by reducing unnecessary rendering/evaluations."
      },
      {
        question: "What is the Context API, and when would you use it instead of Redux?",
        answer: "Context API is a built-in React feature to share global state directly without prop drilling. Redux is an external state management library that provides a centralized store, middleware support, and dev tools. You use Context for simple global state (like theme or user auth) and Redux for complex, high-frequency state updates with strict debugging requirements."
      },
      {
        question: "How do you handle side effects in React using the useEffect hook?",
        answer: "The useEffect hook takes a callback function and a dependency array. It runs after rendering. If the dependency array is empty [], it runs once (like componentDidMount). If it contains variables, it runs whenever those change. Returning a function from the callback serves as the cleanup phase (like componentWillUnmount) to clean up subscriptions or timers."
      }
    ],
    javascript: [
      {
        question: "Explain the concept of closures in JavaScript and provide a real-world use case.",
        answer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned. Real-world use cases include data privacy (creating private variables) and function factories."
      },
      {
        question: "What is the difference between synchronous and asynchronous code in JavaScript? How does the event loop handle asynchronous tasks?",
        answer: "Synchronous code executes line-by-line sequentially, blocking subsequent tasks until the current one finishes. Asynchronous code executes non-blockingly, allowing other code to run while waiting for an operation (like API calls) to complete. The event loop monitors the call stack and callback queue. When the call stack is empty, it pushes deferred tasks from the microtask/callback queue to the stack."
      },
      {
        question: "Explain the differences between var, let, and const in ES6 JavaScript.",
        answer: "var is function-scoped, hoisted, and can be redeclared and reassigned. let is block-scoped, not initialized during hoisting (in the temporal dead zone), and can be reassigned but not redeclared. const is block-scoped, not initialized during hoisting, and cannot be reassigned or redeclared (though object properties can be mutated)."
      },
      {
        question: "What are Promises, and how do they differ from async/await syntax?",
        answer: "Promises are objects representing the eventual completion or failure of an asynchronous operation. They use .then() and .catch() chains. async/await is a syntactic sugar built on top of Promises, allowing asynchronous code to be written in a synchronous-looking, cleaner, and more readable manner using try-catch blocks."
      },
      {
        question: "What is prototypal inheritance in JavaScript, and how does the prototype chain work?",
        answer: "JavaScript uses prototypal inheritance, meaning objects can inherit properties and methods from other objects. Every object has an internal link to another object called its prototype. When accessing a property on an object, JavaScript searches the object itself first, then recursively traverses up the prototype chain until it finds the property or reaches null."
      }
    ],
    node: [
      {
        question: "What is Node.js, and how does its non-blocking event-driven architecture work?",
        answer: "Node.js is a runtime environment built on Chrome's V8 engine that executes JavaScript on the server side. It uses a single-threaded event loop and asynchronous, non-blocking I/O operations. Heavy tasks are delegated to worker threads via libuv, allowing Node to handle thousands of concurrent connections efficiently without thread overhead."
      },
      {
        question: "Explain the difference between process.nextTick() and setImmediate() in Node.js.",
        answer: "process.nextTick() schedules a callback to be invoked immediately after the current phase of the event loop completes, before the loop continues (runs in microtask queue). setImmediate() schedules a callback to run in the 'check' phase of the event loop, after the poll phase completes."
      },
      {
        question: "What are streams in Node.js, and what are the different types of streams?",
        answer: "Streams are collections of data that are read or written sequentially in chunks, instead of loading everything into memory. The four types are: Readable (for reading data, e.g., fs.createReadStream), Writable (for writing, e.g., fs.createWriteStream), Duplex (both readable and writable, e.g., TCP sockets), and Transform (duplex streams that modify data, e.g., zlib compression)."
      },
      {
        question: "How does error handling work in asynchronous Express.js routes?",
        answer: "In asynchronous Express handlers, errors must be caught (using try-catch) and passed to the next() middleware function. Express has a default error handler, but custom error-handling middleware can be defined with four arguments (err, req, res, next) to log and format error responses gracefully."
      }
    ],
    generic: [
      {
        question: "What are the key responsibilities of a developer in a team environment, and how do you ensure high code quality?",
        answer: "Responsibilities include writing clean, maintainable, and well-documented code, participating in peer code reviews, collaborating with cross-functional teams, and contributing to tests. Ensuring quality involves following style guides, automated testing, continuous integration, and keeping up with refactoring."
      },
      {
        question: "How do you debug a performance bottleneck in a web application?",
        answer: "First, measure performance using tools like Chrome DevTools Performance/Lighthouse (frontend) or APM profiling tools (backend). Identify blocking operations (long-running JavaScript, unoptimized database queries, asset payloads). Implement solutions like caching, pagination, code-splitting, lazy loading, and database indexing, then measure again to verify improvements."
      },
      {
        question: "Describe your approach to writing clean, maintainable code.",
        answer: "I follow SOLID principles, write descriptive names for variables and functions, keep functions small and focused on a single responsibility, write unit tests, and limit comments to explaining 'why' rather than 'what'. I also participate in code reviews and use linting/formatting tools."
      }
    ]
  };

  let selected = bank.generic;
  if (normalizedRole.includes("react") || normalizedTopics.includes("react")) {
    selected = bank.react;
  } else if (normalizedRole.includes("node") || normalizedTopics.includes("node") || normalizedRole.includes("backend")) {
    selected = bank.node;
  } else if (normalizedRole.includes("javascript") || normalizedTopics.includes("javascript") || normalizedRole.includes("frontend")) {
    selected = bank.javascript;
  }

  return selected.map((q) => ({
    question: q.question,
    answer: q.answer
  }));
};

const getFallbackFeedback = (answers) => {
  const questionFeedback = answers.map((a, i) => {
    const userAnswer = (a.userAnswer || "").trim();
    const correctAnswer = a.correctAnswer || "";
    
    let score = 0;
    let feedback = "";
    
    if (!userAnswer) {
      score = 0;
      feedback = "No answer was provided. To improve, try to draft a response even if you are uncertain, drawing on related concepts.";
    } else {
      const userWords = new Set(userAnswer.toLowerCase().split(/\W+/));
      const correctWords = correctAnswer.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      
      let matches = 0;
      correctWords.forEach(w => {
        if (userWords.has(w)) matches++;
      });
      
      const matchRatio = correctWords.length > 0 ? matches / correctWords.length : 0;
      
      if (matchRatio > 0.4 || userAnswer.length > 80) {
        score = Math.floor(Math.random() * 15) + 80; // 80-95
        feedback = "Excellent response. You clearly demonstrated understanding of the key concepts and explained them using correct technical terminology. Keep up the great work!";
      } else if (matchRatio > 0.15 || userAnswer.length > 30) {
        score = Math.floor(Math.random() * 20) + 60; // 60-79
        feedback = "Good attempt. You captured some core elements, but the explanation could be more comprehensive. Try to include more specific details and elaborate on practical use cases.";
      } else {
        score = Math.floor(Math.random() * 20) + 35; // 35-54
        feedback = "Partial understanding shown. The response is quite brief. For better results, explain the core mechanism, syntax, and how it contrasts with alternatives.";
      }
    }
    
    return {
      question: a.question,
      score,
      feedback,
      userAnswer: a.userAnswer || "No answer provided"
    };
  });
  
  const answeredCount = answers.filter(a => (a.userAnswer || "").trim().length > 0).length;
  const totalScore = questionFeedback.reduce((sum, q) => sum + q.score, 0);
  const overallScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
  
  const strengths = [
    "Demonstrates core logic and structured problem solving.",
    "Shows active engagement with technical vocabulary and definitions."
  ];
  const improvements = [
    "Provide deeper implementation specifics and concrete examples.",
    "Practice structural formatting to present complex ideas step-by-step."
  ];
  
  return {
    overallScore,
    totalQuestions: answers.length,
    answeredQuestions: answeredCount,
    strengths,
    improvements,
    questionFeedback
  };
};

module.exports = { getFallbackQuestions, getFallbackFeedback };
