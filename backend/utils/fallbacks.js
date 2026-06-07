const getFallbackQuestions = (role, experience, topics, questionCount = 5) => {
  const normalizedRole = (role || "Developer").trim();
  const normalizedTopics = (topics || "").trim();
  const count = parseInt(questionCount) || 5;
  
  const topicsList = normalizedTopics.split(",")
    .map(t => t.trim())
    .filter(Boolean);
  
  const mainTopic = topicsList[0] || normalizedTopics || "Software Development";

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
    ]
  };

  let baseQuestions = [];
  const lowerTopic = mainTopic.toLowerCase();
  
  if (lowerTopic === "react") {
    baseQuestions = [...bank.react];
  } else if (lowerTopic === "node" || lowerTopic === "node.js" || lowerTopic === "backend") {
    baseQuestions = [...bank.node];
  } else if (lowerTopic === "javascript" || lowerTopic === "js") {
    baseQuestions = [...bank.javascript];
  }

  const capitalizedTopic = mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1);
  const dynamicTemplates = [
    {
      question: `What is the core purpose of ${capitalizedTopic}, and what are the key architectural patterns or principles it introduces?`,
      answer: `${capitalizedTopic} is primarily used to solve architectural and implementation challenges. It introduces clean patterns for structuring code, separating concerns, and optimizing resources. Key principles include scalability, reusability, and maintainability.`
    },
    {
      question: `Can you explain how state, configuration, or data binding is managed when working with ${capitalizedTopic}?`,
      answer: `Data and configurations in ${capitalizedTopic} are typically managed via central state stores, configuration managers, or props. This ensures a single source of truth, deterministic rendering, and clear data flows.`
    },
    {
      question: `What are some common lifecycle events, hooks, or phases associated with ${capitalizedTopic}, and how do you handle side effects?`,
      answer: `Lifecycle phases include setup, execution, and cleanup. Side effects (such as data fetching or subscriptions) are managed within dedicated event handlers or lifecycle callbacks, ensuring they don't block main threads.`
    },
    {
      question: `How does ${capitalizedTopic} address application performance, and what are some best practices to optimize it?`,
      answer: `Performance optimization in ${capitalizedTopic} involves minification, lazy loading, caching computational tasks (memoization), reducing unneeded render cycles, and ensuring efficient database indexes or API payloads.`
    },
    {
      question: `Explain how you would write unit tests or debug errors in an application using ${capitalizedTopic}.`,
      answer: `Testing is done using framework-specific assertions, mocking external APIs, and checking boundary conditions. Debugging relies on developer tools, inspector terminals, logging stacks, and step-by-step code execution.`
    },
    {
      question: `What are the industry best practices for securing applications built using ${capitalizedTopic}?`,
      answer: `Security best practices include sanitizing all inputs to prevent injection attacks, implementing robust authentication/authorization, encrypting sensitive data, and regularly auditing dependencies.`
    },
    {
      question: `How do you handle error boundaries, exception bubbling, or graceful degradation in ${capitalizedTopic}?`,
      answer: `Errors are managed using try-catch blocks, global error handlers, or framework-specific error boundaries. It is crucial to log errors and present a user-friendly fallback UI.`
    },
    {
      question: `Compare the synchronous vs. asynchronous behavior in ${capitalizedTopic} and explain when to use each.`,
      answer: `Synchronous operations block execution until complete, ideal for simple in-memory tasks. Asynchronous operations run non-blockingly, essential for network calls, file system tasks, or timer functions.`
    },
    {
      question: `Explain how dependency injection, modularization, or package management is structured in ${capitalizedTopic}.`,
      answer: `Modularization is achieved by splitting code into reusable packages or files. Dependency injection handles passing services to components, reducing coupling and improving testability.`
    },
    {
      question: `What are the major challenges or limitations you have encountered with ${capitalizedTopic}, and how did you overcome them?`,
      answer: `Key limitations often involve steep learning curves, rendering overheads, or complex state flows. These are overcome through deep architectural planning, community patterns, and optimization plugins.`
    },
    {
      question: `How do you scale an application using ${capitalizedTopic} to handle high traffic or large datasets?`,
      answer: `Scaling involves horizontal replication, implementing load balancers, optimizing database queries with indexing, using message queues for background processing, and implementing caching layers.`
    },
    {
      question: `How does ${capitalizedTopic} interface with databases or manage persistent storage?`,
      answer: `${capitalizedTopic} interfaces with databases via ORMs, ODMs, or direct drivers. Persistent storage is managed through connection pooling, transaction locks, and migrations.`
    },
    {
      question: `How do you design clean, reliable APIs or data exchange layers in ${capitalizedTopic}?`,
      answer: `Clean API design involves adhering to REST or GraphQL standards, validating all request bodies, using proper HTTP status codes, and documenting routes using Swagger or Postman.`
    },
    {
      question: `What is your approach to logging, monitoring, or telemetry in ${capitalizedTopic}?`,
      answer: `Monitoring involves using structured logging, tracing requests with transaction IDs, tracking error rates via Sentry or Winston, and observing performance metrics through Grafana.`
    },
    {
      question: `How are external dependencies, packages, or libraries managed and audited in ${capitalizedTopic}?`,
      answer: `Dependencies are managed using package locks, audited regularly for vulnerabilities using npm audit or Snyk, and pinned to specific versions to prevent breaking changes.`
    },
    {
      question: `Explain the caching mechanisms or data reuse strategies available in ${capitalizedTopic}.`,
      answer: `Caching strategies include HTTP caching, in-memory caching using Redis, caching expensive calculations via local memoization, and distributing resources via CDNs.`
    },
    {
      question: `How does ${capitalizedTopic} manage memory allocation, and how do you prevent memory leaks?`,
      answer: `Memory is managed via garbage collection or manual reference tracking. Leaks are prevented by cleaning up event listeners, closing database connections, and avoiding global variables.`
    },
    {
      question: `How do you integrate applications built with ${capitalizedTopic} into a CI/CD pipeline for automated testing and deployment?`,
      answer: `CI/CD integration involves defining workflow files (e.g. GitHub Actions), running automated linting and test suites on push, building artifacts, and deploying to hosting services.`
    },
    {
      question: `How does ${capitalizedTopic} fit into a microservices vs. monolithic architecture?`,
      answer: `${capitalizedTopic} can act as independent service containers communicating via gRPC/REST in microservices, or run as a single deployment block in a monolithic structure.`
    },
    {
      question: `What accessibility (a11y) or user-standard compliance rules apply to projects built using ${capitalizedTopic}?`,
      answer: `Compliance involves supporting ARIA labels, semantic HTML tags, keyboard navigation, contrast guidelines, and auditing with Axe-Core or Lighthouse.`
    },
    {
      question: `What is the importance of code documentation and style guides in ${capitalizedTopic} development?`,
      answer: `Style guides (e.g. ESLint, Prettier) enforce consistent styling. Code documentation (e.g. JSDoc) explains design decisions, API contracts, and guides onboarding.`
    },
    {
      question: `Describe the process of upgrading or migrating a legacy application to the latest version of ${capitalizedTopic}.`,
      answer: `Migration involves auditing deprecated APIs, running codemods, testing backward compatibility, and incrementally upgrading versions while running full regression test suites.`
    },
    {
      question: `How do developers collaborate on a shared codebase using ${capitalizedTopic} workflows and branching models?`,
      answer: `Collaboration relies on Git branching (e.g. GitFlow), strict pull request templates, code reviews, automated status checks, and pair programming on complex modules.`
    },
    {
      question: `How do you handle environment-specific configurations (e.g. dev, staging, prod) in ${capitalizedTopic}?`,
      answer: `Configurations are managed via environment variables (.env files), configuration loaders, and build-time build options to inject staging vs production API keys.`
    },
    {
      question: `What are the latest features or future trends in the ecosystem of ${capitalizedTopic}?`,
      answer: `Trends focus on zero-bundle size runtimes, server-side streaming, native compilation, integrated dev tools, and tighter integration with AI models.`
    },
    {
      question: `Explain how data integrity, schemas, or type checking is enforced when coding with ${capitalizedTopic}.`,
      answer: `Integrity is enforced using strict types (TypeScript), runtime validation libraries (Zod, Joi), database schema constraints, and integration test validation.`
    },
    {
      question: `What are the typical deployment targets, hosting providers, or cloud services used for ${capitalizedTopic}?`,
      answer: `Typical targets include AWS, Vercel, Netlify, Render, Heroku, or Dockerized containers deployed to Kubernetes clusters.`
    },
    {
      question: `How does ${capitalizedTopic} support internationalization (i18n) and localization (l10n)?`,
      answer: `Support includes using translation dictionaries, date/currency formatting libraries, language routing detection, and RTL layout support.`
    },
    {
      question: `What are some common anti-patterns or code smells in ${capitalizedTopic} that should be avoided?`,
      answer: `Anti-patterns include bloated components/files, tight coupling of logic, ignoring error states, nested callback hell, and hardcoded secrets.`
    },
    {
      question: `How do you manage version control conflicts or database migrations in a team project using ${capitalizedTopic}?`,
      answer: `Migrations are managed using CLI tools (Prisma, Knex) with timestamped migration scripts. Git conflicts are resolved using interactive rebase and peer verification.`
    }
  ];

  let result = [...baseQuestions];
  let templateIndex = 0;
  while (result.length < count && templateIndex < dynamicTemplates.length) {
    const template = dynamicTemplates[templateIndex];
    if (!result.some(q => q.question === template.question)) {
      result.push(template);
    }
    templateIndex++;
  }

  return result.slice(0, count);
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
