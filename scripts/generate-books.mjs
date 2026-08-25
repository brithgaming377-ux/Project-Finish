// One-off generator script — run with `node scripts/generate-books.mjs`
// to regenerate data/books.json. Not part of the app runtime.
import { writeFileSync } from 'fs'

const base = [
  { id: 1, title: 'Clean Architecture', author: 'R. C. Martin', category: 'Technology', pages: 432, year: 2017, color: '#1B1F3B',
    description: 'A guide to structuring software systems so that business logic stays independent of frameworks, databases, and delivery mechanisms.',
    long: [
      'Robert C. Martin distills four decades of software design experience into a set of rules and practices for building systems that survive change. The central argument is that architecture is about intent, not tools: frameworks, databases, and UI layers are details that should be kept at the edges of a system, never at its core.',
      'The book walks through the SOLID principles, component cohesion and coupling, and the boundaries that separate policy from mechanism. Case studies show what happens when those boundaries are ignored — systems that become expensive to change even when the business logic itself is simple.',
      'It closes with practical advice on organizing a codebase into layers that can be tested, replaced, and understood independently, aimed at engineers who want their systems to still make sense two years after launch.'
    ],
    toc: ['What Is Design and Architecture?', 'Programming Paradigms', 'Design Principles (SOLID)', 'Component Principles', 'Architecture', 'Boundaries and Layers', 'The Clean Architecture', 'Case Studies', 'The Missing Chapter'],
    tags: ['software design', 'engineering practice', 'systems thinking'],
    level: 'Intermediate', publisher: 'Prentice Hall', language: 'English', format: 'EPUB' },

  { id: 2, title: 'The Pragmatic Programmer', author: 'D. Thomas & A. Hunt', category: 'Technology', pages: 352, year: 1999, color: '#6B8F71',
    description: 'A collection of practical habits and principles for working programmers, covering everything from debugging and testing to communication and career growth.',
    long: [
      'Rather than teaching a language or framework, this book teaches a way of working. It collects field-tested habits — from "don\'t repeat yourself" to "programming by coincidence" — into short, quotable tips that hold up regardless of tech stack.',
      'Topics range from the very technical (automated testing, debugging strategy, orthogonal design) to the very human (communicating with stakeholders, estimating honestly, managing your own career as a craft).',
      'Two decades after its first edition, it remains one of the most recommended books for developers moving from "writes working code" to "writes code a team can live with."'
    ],
    toc: ['A Pragmatic Philosophy', 'A Pragmatic Approach', 'The Basic Tools', 'Pragmatic Paranoia', 'Bend or Break', 'While You Are Coding', 'Before the Project', 'Pragmatic Projects'],
    tags: ['career growth', 'best practices', 'craftsmanship'],
    level: 'Beginner', publisher: 'Addison-Wesley', language: 'English', format: 'PDF' },

  { id: 3, title: 'Networks, Crowds & Markets', author: 'Easley & Kleinberg', category: 'Technology', pages: 512, year: 2010, color: '#C97F1E',
    description: 'An introduction to the mathematics behind connected systems — how networks, incentives, and information spread shape everything from social platforms to financial markets.',
    long: [
      'This textbook bridges economics, sociology, and computing to explain why connected systems behave the way they do. It builds from simple graph theory up to game-theoretic models of auctions, information cascades, and market structure.',
      'Each chapter pairs formal models with real examples — the spread of a meme, the structure of the web, the pricing of a matching market — making the mathematics feel grounded rather than abstract.',
      'Suitable as a course text or self-study for anyone who wants a rigorous but accessible foundation in network science.'
    ],
    toc: ['Graphs', 'Strong and Weak Ties', 'Networks in Their Surrounding Contexts', 'Game Theory', 'Auctions', 'Information Networks', 'Cascading Behavior', 'The Small-World Phenomenon'],
    tags: ['network science', 'game theory', 'economics'],
    level: 'Advanced', publisher: 'Cambridge University Press', language: 'English', format: 'PDF' },

  { id: 4, title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy', pages: 254, year: 180, color: '#4A4E69',
    description: 'The private journal of a Roman emperor reflecting on duty, mortality, and self-discipline — one of the foundational texts of Stoic philosophy.',
    long: [
      'Written as private notes rather than a work meant for publication, Meditations captures an emperor thinking through the same questions any person faces: how to act well, how to face loss, how to stay steady when things go wrong.',
      'The twelve books move in short, aphoristic passages rather than a linear argument, drawing on Stoic ideas about virtue, impermanence, and the limits of what is within our control.',
      'Its plainness is part of its staying power — this is a ruler talking to himself, not performing wisdom for an audience, which is part of why it still reads as sincere nearly two thousand years later.'
    ],
    toc: ['Book I: Debts and Lessons', 'Book II: On the Banks of the Gran', 'Book III: Meditations in Carnuntum', 'Book IV–VI: On Virtue', 'Book VII–IX: On Impermanence', 'Book X–XII: On Duty'],
    tags: ['stoicism', 'classics', 'self-discipline'],
    level: 'Beginner', publisher: 'Penguin Classics', language: 'English (translated)', format: 'EPUB' },

  { id: 5, title: 'Beyond Good and Evil', author: 'F. Nietzsche', category: 'Philosophy', pages: 297, year: 1886, color: '#8C5E3C',
    description: 'A critique of traditional morality and philosophy, arguing for a reevaluation of values beyond simple notions of good and evil.',
    long: [
      'Nietzsche opens by questioning the assumptions underneath centuries of philosophy — the idea that truth, morality, and "the good" are fixed, discoverable things rather than products of history and psychology.',
      'Across nine parts he attacks dogmatism in philosophy, examines the psychology behind moral judgments, and sketches his idea of the "free spirit" unconstrained by inherited values.',
      'It is dense and aphoristic by design, meant to be argued with rather than simply absorbed — a book that rewards slow, skeptical reading.'
    ],
    toc: ['On the Prejudices of Philosophers', 'The Free Spirit', 'The Religious Mood', 'Apophthegms and Interludes', 'Natural History of Morals', 'We Scholars', 'Our Virtues', 'Peoples and Fatherlands', 'What Is Noble?'],
    tags: ['ethics', 'classics', 'critical theory'],
    level: 'Advanced', publisher: 'Vintage', language: 'English (translated)', format: 'EPUB' },

  { id: 6, title: 'The Republic', author: 'Plato', category: 'Philosophy', pages: 416, year: -375, color: '#3F6C51',
    description: 'A Socratic dialogue examining justice, the ideal state, and the nature of a well-ordered soul.',
    long: [
      'Framed as a conversation led by Socrates, The Republic asks a deceptively simple question — what is justice? — and follows it into a sweeping account of the ideal city-state, education, and the structure of the human soul.',
      'Famous passages include the Allegory of the Cave, the theory of Forms, and the argument that philosophers, not warriors or merchants, are best suited to govern.',
      'It remains a foundational text of Western political philosophy, still assigned in courses on ethics, politics, and epistemology.'
    ],
    toc: ['Book I: What Is Justice?', 'Book II–IV: The Just City', 'Book V–VII: Philosopher-Kings and the Cave', 'Book VIII–IX: The Decline of States', 'Book X: Poetry and the Afterlife'],
    tags: ['classics', 'political philosophy', 'ethics'],
    level: 'Advanced', publisher: 'Oxford World\'s Classics', language: 'English (translated)', format: 'PDF' },

  { id: 7, title: 'A Brief History of Time', author: 'S. Hawking', category: 'Science', pages: 256, year: 1988, color: '#1B1F3B',
    description: 'An accessible tour of cosmology — from the Big Bang to black holes — written for readers without a physics background.',
    long: [
      'Stephen Hawking set out to explain the biggest questions in cosmology — where the universe came from, what a black hole actually is, whether time had a beginning — without requiring a physics degree to follow along.',
      'The book moves from the history of astronomy through general relativity and quantum mechanics to Hawking\'s own work on black holes and the origin of the universe, using almost no equations.',
      'It became one of the best-selling science books ever published, credited with bringing cosmology into mainstream conversation.'
    ],
    toc: ['Our Picture of the Universe', 'Space and Time', 'The Expanding Universe', 'The Uncertainty Principle', 'Elementary Particles', 'Black Holes', 'The Origin of the Universe', 'The Arrow of Time'],
    tags: ['cosmology', 'physics', 'popular science'],
    level: 'Beginner', publisher: 'Bantam Books', language: 'English', format: 'EPUB' },

  { id: 8, title: 'The Selfish Gene', author: 'R. Dawkins', category: 'Science', pages: 384, year: 1976, color: '#6B8F71',
    description: 'A gene-centered view of evolution, arguing that genes, not individuals or species, are the primary unit of natural selection.',
    long: [
      'Richard Dawkins reframes evolution from the point of view of the gene: organisms, in this telling, are vehicles genes build to replicate themselves, and much of animal (and human) behavior can be understood through that lens.',
      'The book introduces ideas like the "extended phenotype" and coins the term "meme" as a cultural analogue to the gene, extending the argument beyond biology into culture.',
      'It remains one of the most influential and most argued-about popular science books of the last fifty years.'
    ],
    toc: ['Why Are People?', 'The Replicators', 'Immortal Coils', 'The Gene Machine', 'Aggression', 'Genesmanship', 'Family Planning', 'Battle of the Generations', 'Memes: The New Replicators'],
    tags: ['evolution', 'biology', 'popular science'],
    level: 'Intermediate', publisher: 'Oxford University Press', language: 'English', format: 'PDF' },

  { id: 9, title: 'Cosmos', author: 'C. Sagan', category: 'Science', pages: 396, year: 1980, color: '#C97F1E',
    description: 'A sweeping journey through astronomy, biology, and the history of scientific discovery, written to make the universe feel within reach.',
    long: [
      'Carl Sagan wrote Cosmos as a companion to his television series of the same name, tracing the history of science and the structure of the universe with a sense of wonder rather than dry recitation of facts.',
      'It moves fluidly between the origins of life on Earth, the scale of the cosmos, the history of astronomy, and the risks and promise of scientific civilization — tied together by Sagan\'s recurring theme that we are, in his words, "starstuff contemplating the stars."',
      'Decades later it remains a touchstone for popular science writing, admired as much for its prose as its content.'
    ],
    toc: ['The Shores of the Cosmic Ocean', 'One Voice in the Cosmic Fugue', 'The Harmony of the Worlds', 'Heaven and Hell', 'Blues for a Red Planet', 'Travelers\' Tales', 'The Backbone of Night', 'Encyclopaedia Galactica'],
    tags: ['astronomy', 'popular science', 'history of science'],
    level: 'Beginner', publisher: 'Random House', language: 'English', format: 'EPUB' },

  { id: 10, title: 'Dare to Lead', author: 'B. Brown', category: 'Leadership', pages: 320, year: 2018, color: '#4A4E69',
    description: 'A framework for leading with courage and vulnerability, drawn from research on what separates brave leaders from the rest.',
    long: [
      'Brené Brown applies her research on vulnerability and shame to the workplace, arguing that "armored" leadership — defensiveness, perfectionism, never admitting uncertainty — quietly costs organizations trust and performance.',
      'The book is built around four skill sets that can be taught and measured: rumbling with vulnerability, living into values, braving trust, and learning to rise after setbacks.',
      'It draws on interviews with leaders across industries and includes practical language teams can use to talk about difficult moments honestly.'
    ],
    toc: ['The Heart of Daring Leadership', 'Rumbling with Vulnerability', 'The Armored Leader', 'Living into Our Values', 'Braving Trust', 'Learning to Rise'],
    tags: ['leadership', 'management', 'workplace culture'],
    level: 'Intermediate', publisher: 'Random House Business', language: 'English', format: 'EPUB' },

  { id: 11, title: 'Good to Great', author: 'J. Collins', category: 'Leadership', pages: 300, year: 2001, color: '#8C5E3C',
    description: 'A research-based look at what allows some companies to make the leap from average performance to sustained excellence.',
    long: [
      'Jim Collins and his research team studied companies that sustained dramatically improved performance for at least fifteen years, comparing each to a similar company that never made the leap.',
      'The findings — "Level 5" leadership, getting the right people on the bus before deciding direction, the "hedgehog concept," a culture of discipline — became widely cited shorthand in business writing.',
      'It is written for practitioners rather than academics, heavy on case studies of real (if sometimes dated) companies.'
    ],
    toc: ['Good Is the Enemy of Great', 'Level 5 Leadership', 'First Who, Then What', 'Confront the Brutal Facts', 'The Hedgehog Concept', 'A Culture of Discipline', 'Technology Accelerators', 'The Flywheel'],
    tags: ['business strategy', 'management', 'case studies'],
    level: 'Intermediate', publisher: 'HarperBusiness', language: 'English', format: 'PDF' },

  { id: 12, title: 'The Five Dysfunctions of a Team', author: 'P. Lencioni', category: 'Leadership', pages: 229, year: 2002, color: '#3F6C51',
    description: 'A leadership fable illustrating the common breakdowns — from lack of trust to inattention to results — that keep teams from performing.',
    long: [
      'Told as a business fable about a fictional startup executive team, the book dramatizes five compounding failures: absence of trust, fear of conflict, lack of commitment, avoidance of accountability, and inattention to results.',
      'Each dysfunction builds on the one before it, forming a pyramid model that has become a common shorthand in management training.',
      'The second half of the book distills the story into a practical model and assessment teams can use on themselves.'
    ],
    toc: ['Underachievement', 'Lighting the Fire', 'Heavy Lifting', 'Traction', 'The Model', 'Team Assessment'],
    tags: ['teamwork', 'management', 'organizational behavior'],
    level: 'Beginner', publisher: 'Jossey-Bass', language: 'English', format: 'EPUB' },

  { id: 13, title: 'Fluent Forever', author: 'G. Wyner', category: 'Language', pages: 336, year: 2014, color: '#1B1F3B',
    description: 'A practical method for learning any language quickly, using memory techniques, pronunciation training, and spaced repetition.',
    long: [
      'Gabriel Wyner, an opera singer who learned several languages fluently as an adult, breaks language learning into a system: train your ear and mouth first, build vocabulary through image association rather than translation, and use spaced repetition to make it stick.',
      'The book is unusually concrete — it explains how to build your own flashcard decks, which sounds to prioritize, and how to sequence grammar so it reinforces rather than overwhelms.',
      'It is aimed at self-directed adult learners rather than classroom settings.'
    ],
    toc: ['Why Forever?', 'How to Learn (and Keep) Any Language', 'Sounds', 'Words', 'Grammar', 'Building a Practice'],
    tags: ['language learning', 'self-study', 'memory techniques'],
    level: 'Beginner', publisher: 'Harmony', language: 'English', format: 'PDF' },

  { id: 14, title: 'The Elements of Style', author: 'Strunk & White', category: 'Language', pages: 105, year: 1959, color: '#6B8F71',
    description: 'A compact, enduring guide to clear and correct English writing, covering grammar, usage, and composition principles.',
    long: [
      'Originally a set of course notes by William Strunk Jr., later expanded by E. B. White, this slim book distills English usage into direct rules: omit needless words, use the active voice, keep related words together.',
      'It is opinionated by design — some of its stricter rules are debated by modern linguists — but its brevity and clarity have made it a standard reference for generations of writers.',
      'Best read as a set of defaults to internalize rather than laws to follow without exception.'
    ],
    toc: ['Elementary Rules of Usage', 'Elementary Principles of Composition', 'A Few Matters of Form', 'Words and Expressions Commonly Misused', 'An Approach to Style'],
    tags: ['writing', 'grammar', 'style guide'],
    level: 'Beginner', publisher: 'Pearson', language: 'English', format: 'PDF' },

  { id: 15, title: 'Khmer for Beginners', author: 'R. K. Headley', category: 'Language', pages: 288, year: 1997, color: '#C97F1E',
    description: 'An introductory course in spoken and written Khmer, covering script, pronunciation, and everyday vocabulary.',
    long: [
      'Designed as a structured course rather than a phrasebook, this text introduces the Khmer script alongside spoken pronunciation from the first lesson, rather than relying on romanization throughout.',
      'Lessons build from greetings and numbers up through everyday conversation, with grammar notes and exercises after each unit.',
      'It is commonly used in university Khmer-language programs and by long-term residents learning to read as well as speak.'
    ],
    toc: ['The Khmer Script', 'Greetings and Introductions', 'Numbers and Time', 'Family and Daily Life', 'Shopping and Directions', 'Reading Practice'],
    tags: ['khmer', 'language learning', 'script'],
    level: 'Beginner', publisher: 'Dunwoody Press', language: 'English / Khmer', format: 'PDF' },

  { id: 16, title: 'Sapiens', author: 'Y. N. Harari', category: 'History', pages: 443, year: 2011, color: '#4A4E69',
    description: 'A sweeping account of human history, from the cognitive revolution to the present, exploring how shared myths shaped civilization.',
    long: [
      'Yuval Noah Harari traces Homo sapiens from an unremarkable savanna primate to the dominant species on the planet, organizing the story around three revolutions: cognitive, agricultural, and scientific.',
      'His central claim is that large-scale human cooperation depends on shared fictions — money, nations, religions, corporations — that exist only because enough people believe in them together.',
      'The book is written for a general audience and moves quickly across enormous stretches of time, favoring big ideas over exhaustive detail.'
    ],
    toc: ['The Cognitive Revolution', 'The Agricultural Revolution', 'The Unification of Humankind', 'The Scientific Revolution'],
    tags: ['anthropology', 'big history', 'popular nonfiction'],
    level: 'Beginner', publisher: 'Harper', language: 'English', format: 'EPUB' },

  { id: 17, title: 'Guns, Germs and Steel', author: 'J. Diamond', category: 'History', pages: 480, year: 1997, color: '#8C5E3C',
    description: 'An argument for how geography and environment, rather than inherent differences between peoples, shaped the course of world history.',
    long: [
      'Jared Diamond asks why some societies developed guns, germs, and steel earlier than others, and argues the answer lies mostly in geography and access to domesticable plants and animals — not in differences between peoples.',
      'The book covers agriculture, disease, writing systems, and technology, tracing how early advantages compounded over thousands of years into the inequalities of the modern world.',
      'It won the Pulitzer Prize and remains widely read, though some of its arguments have been challenged by later historians and anthropologists.'
    ],
    toc: ['Up to the Starting Line', 'The Rise and Spread of Food Production', 'From Food to Guns, Germs and Steel', 'Around the World in Five Chapters'],
    tags: ['world history', 'geography', 'anthropology'],
    level: 'Intermediate', publisher: 'W. W. Norton', language: 'English', format: 'PDF' },

  { id: 18, title: 'A History of Cambodia', author: 'D. Chandler', category: 'History', pages: 328, year: 1983, color: '#3F6C51',
    description: 'A comprehensive survey of Cambodian history, from the Angkor era through the twentieth century.',
    long: [
      'David Chandler\'s survey covers Cambodia from the Angkor kingdom through French colonization, independence, and the twentieth-century upheavals that followed, drawing on both Khmer and colonial-era sources.',
      'It is widely used as a university text and remains one of the most accessible single-volume histories of the country available in English.',
      'Later editions extend the account into the postwar and contemporary period.'
    ],
    toc: ['Early Cambodia', 'The Angkorian Period', 'Cambodia Under French Rule', 'Independence and Sihanouk', 'War and Its Aftermath', 'Toward the Present'],
    tags: ['cambodia', 'southeast asia', 'world history'],
    level: 'Intermediate', publisher: 'Westview Press', language: 'English', format: 'PDF' },

  { id: 19, title: 'Deep Work', author: 'C. Newport', category: 'Other', pages: 296, year: 2016, color: '#1B1F3B',
    description: 'An argument for the value of focused, undistracted effort in a world of constant interruption, with strategies for cultivating it.',
    long: [
      'Cal Newport defines "deep work" as focused, cognitively demanding effort performed without distraction, and argues it is both increasingly rare and increasingly valuable as knowledge work becomes more fragmented by notifications and shallow tasks.',
      'The first half makes the case for why deep work matters; the second half offers concrete rules — scheduling focus blocks, quitting social media strategically, embracing boredom — for building the habit.',
      'It draws on examples from academics, writers, and executives who structure their days around protected focus time.'
    ],
    toc: ['Deep Work Is Valuable', 'Deep Work Is Rare', 'Deep Work Is Meaningful', 'Work Deeply', 'Embrace Boredom', 'Quit Social Media', 'Drain the Shallows'],
    tags: ['productivity', 'focus', 'knowledge work'],
    level: 'Beginner', publisher: 'Grand Central Publishing', language: 'English', format: 'EPUB' },

  { id: 20, title: 'Atomic Habits', author: 'J. Clear', category: 'Other', pages: 320, year: 2018, color: '#6B8F71',
    description: 'A practical framework for building good habits and breaking bad ones, built around small, compounding changes.',
    long: [
      'James Clear argues that meaningful change comes not from big, dramatic goals but from small habits repeated consistently — improving by 1% at a time compounds into large results over months and years.',
      'The book introduces the "Four Laws of Behavior Change" (make it obvious, attractive, easy, and satisfying) as a practical framework for designing new habits and breaking existing ones.',
      'It is heavy on concrete tactics — habit stacking, environment design, identity-based habits — rather than motivational theory alone.'
    ],
    toc: ['The Fundamentals', 'The 1st Law: Make It Obvious', 'The 2nd Law: Make It Attractive', 'The 3rd Law: Make It Easy', 'The 4th Law: Make It Satisfying', 'Advanced Tactics'],
    tags: ['habits', 'productivity', 'self-improvement'],
    level: 'Beginner', publisher: 'Avery', language: 'English', format: 'EPUB' },

  { id: 21, title: 'On Writing Well', author: 'W. Zinsser', category: 'Other', pages: 336, year: 1976, color: '#C97F1E',
    description: 'A classic guide to writing clear, simple nonfiction prose, covering everything from technique to attitude.',
    long: [
      'William Zinsser\'s guide focuses specifically on nonfiction — memoir, journalism, business writing, science writing — arguing that the central goal is always clarity, achieved by cutting clutter and finding your own voice.',
      'Unlike more rule-bound style guides, Zinsser emphasizes attitude and confidence as much as mechanics, encouraging writers to write about what genuinely interests them.',
      'It has been in print continuously since the 1970s and is regularly assigned in journalism and writing courses.'
    ],
    toc: ['Principles', 'Methods', 'Forms', 'Attitudes'],
    tags: ['writing', 'nonfiction', 'style'],
    level: 'Beginner', publisher: 'Harper Perennial', language: 'English', format: 'PDF' },

  { id: 22, title: 'Designing Data-Intensive Applications', author: 'M. Kleppmann', category: 'Technology', pages: 616, year: 2017, color: '#4A4E69',
    description: 'A deep look at the ideas behind reliable, scalable data systems — databases, queues, and the tradeoffs between them.',
    long: [
      'Martin Kleppmann maps the landscape of modern data systems — relational and NoSQL databases, message queues, batch and stream processing — around the shared problems they all have to solve: reliability, scalability, and maintainability.',
      'Rather than promoting one tool, the book explains the underlying tradeoffs (consistency vs. availability, latency vs. throughput) so readers can reason about unfamiliar systems instead of memorizing product features.',
      'It has become a standard reference for engineers designing backend systems at scale.'
    ],
    toc: ['Reliable, Scalable, and Maintainable Applications', 'Data Models and Query Languages', 'Storage and Retrieval', 'Replication', 'Partitioning', 'Transactions', 'The Trouble with Distributed Systems', 'Batch Processing', 'Stream Processing'],
    tags: ['databases', 'distributed systems', 'backend engineering'],
    level: 'Advanced', publisher: "O'Reilly Media", language: 'English', format: 'EPUB' },

  { id: 23, title: 'Nicomachean Ethics', author: 'Aristotle', category: 'Philosophy', pages: 288, year: -340, color: '#8C5E3C',
    description: "Aristotle's inquiry into what it means to live well, centered on virtue, practical wisdom, and the idea of a flourishing life.",
    long: [
      'Aristotle asks what the highest human good is, and argues it is eudaimonia — often translated as "flourishing" or "living well" — achieved through a lifetime of virtuous activity guided by reason.',
      'The book develops his doctrine of the mean, where virtue sits between excess and deficiency, and examines specific virtues like courage, temperance, and justice in detail.',
      'It remains foundational to virtue ethics, one of the three major traditions in Western moral philosophy alongside consequentialism and deontology.'
    ],
    toc: ['The Good for Man', 'Moral Virtue', 'The Doctrine of the Mean', 'Justice', 'Intellectual Virtue', 'Friendship', 'Pleasure and Happiness'],
    tags: ['ethics', 'classics', 'virtue'],
    level: 'Advanced', publisher: 'Oxford World\'s Classics', language: 'English (translated)', format: 'PDF' },

  { id: 24, title: 'Silent Spring', author: 'R. Carson', category: 'Science', pages: 368, year: 1962, color: '#3F6C51',
    description: 'A landmark study of the environmental damage caused by synthetic pesticides, widely credited with starting the modern environmental movement.',
    long: [
      'Rachel Carson documented the effects of DDT and other pesticides on birds, insects, and ecosystems, challenging the chemical industry\'s claims of safety with careful, accessible science writing.',
      'The book\'s title refers to a spring without birdsong — a warning about what unchecked pesticide use could do to the natural world.',
      'It led directly to a US government review of pesticide policy and is widely credited with catalyzing the modern environmental movement.'
    ],
    toc: ['A Fable for Tomorrow', 'The Obligation to Endure', 'Elixirs of Death', 'Surface Waters and Underground Seas', 'Realms of the Soil', 'Needless Havoc', 'The Human Price', 'The Other Road'],
    tags: ['environment', 'ecology', 'science writing'],
    level: 'Beginner', publisher: 'Houghton Mifflin', language: 'English', format: 'EPUB' },

  { id: 25, title: 'The Innovator\'s Dilemma', author: 'C. Christensen', category: 'Leadership', pages: 286, year: 1997, color: '#1B1F3B',
    description: 'An explanation of why well-managed, successful companies can fail when disruptive technologies reshape their industries.',
    long: [
      'Clayton Christensen studies why great companies — well-run, customer-focused, and profitable — repeatedly lose to smaller competitors building simpler, cheaper "disruptive" technologies.',
      'The core insight is that the same practices that make companies excellent at serving existing customers make it hard for them to invest in innovations their current customers do not yet want.',
      'It introduced "disruptive innovation" into mainstream business vocabulary and remains widely cited in strategy and product management.'
    ],
    toc: ['How Great Companies Can Fail', 'Value Networks and Innovation', 'Disruptive Technologies in the Disk Drive Industry', 'What Goes Up, Can\'t Go Down', 'Give Responsibility to Organizations That Can Fit the Innovation', 'Performance Provided, Market Demand, and the Product Life Cycle'],
    tags: ['business strategy', 'innovation', 'technology management'],
    level: 'Intermediate', publisher: 'Harvard Business Review Press', language: 'English', format: 'PDF' },

  { id: 26, title: 'Practical Chinese Reader', author: 'Liu Xun', category: 'Language', pages: 312, year: 1981, color: '#C97F1E',
    description: 'A classic structured course in Mandarin Chinese, moving from pinyin and basic characters through everyday conversation.',
    long: [
      'One of the most widely used Mandarin textbooks internationally, this course introduces pinyin pronunciation, basic characters, and grammar through short dialogues rooted in everyday situations.',
      'Each lesson builds vocabulary and grammar incrementally, with exercises designed for classroom use as well as self-study.',
      'Later editions have been updated with contemporary vocabulary, but the structured, dialogue-driven approach remains largely unchanged.'
    ],
    toc: ['Pinyin and Tones', 'Greetings', 'Numbers and Dates', 'Family and Friends', 'Shopping and Travel', 'Reading Practice'],
    tags: ['mandarin', 'language learning', 'grammar'],
    level: 'Beginner', publisher: 'Sinolingua', language: 'English / Chinese', format: 'PDF' },

  { id: 27, title: 'The Silk Roads', author: 'P. Frankopan', category: 'History', pages: 636, year: 2015, color: '#8C5E3C',
    description: 'A history of the world told through the trade routes connecting Asia, the Middle East, and Europe, rather than a Western-centered narrative.',
    long: [
      'Peter Frankopan retells world history with the trade routes between East and West — the "Silk Roads" — at the center, rather than treating Europe as the default vantage point.',
      'The book traces how goods, religions, diseases, and ideas moved along these routes for over two thousand years, shaping empires from Persia to Rome to the Mongol khanates.',
      'It closes by arguing that the regions along these historic routes are once again becoming central to global politics and economics.'
    ],
    toc: ['The Creation of the Silk Road', 'The Road of Faiths', 'The Road to a Christian East', 'The Road to Revolution', 'The Road to Genocide', 'The Road to the Cold War', 'The Road to the Future'],
    tags: ['world history', 'trade', 'geopolitics'],
    level: 'Intermediate', publisher: 'Bloomsbury', language: 'English', format: 'EPUB' },

  { id: 28, title: 'Thinking, Fast and Slow', author: 'D. Kahneman', category: 'Other', pages: 499, year: 2011, color: '#4A4E69',
    description: 'A Nobel laureate\'s account of the two systems that drive human thought — one fast and intuitive, one slow and deliberate — and where each goes wrong.',
    long: [
      'Daniel Kahneman summarizes decades of research into judgment and decision-making, organized around two modes of thought: System 1 (fast, automatic, intuitive) and System 2 (slow, effortful, deliberate).',
      'The book catalogs the biases and heuristics that emerge from over-relying on System 1 — anchoring, availability, loss aversion — with implications for economics, medicine, and everyday choices.',
      'It played a major role in popularizing behavioral economics and remains one of the most cited books in the field.'
    ],
    toc: ['Two Systems', 'Heuristics and Biases', 'Overconfidence', 'Choices', 'Two Selves'],
    tags: ['psychology', 'decision-making', 'behavioral economics'],
    level: 'Intermediate', publisher: 'Farrar, Straus and Giroux', language: 'English', format: 'EPUB' },

  { id: 29, title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Technology', pages: 1312, year: 2009, color: '#C97F1E',
    description: 'The standard reference textbook on algorithms and data structures, covering design techniques, analysis, and a huge range of classic problems.',
    long: [
      'Known widely as "CLRS" after its authors, this is the most commonly assigned algorithms textbook in university computer science programs, covering everything from sorting and searching to graph algorithms and NP-completeness.',
      'Each algorithm is presented with pseudocode, correctness arguments, and rigorous complexity analysis, making it as much a reference as a teaching text.',
      'Its comprehensiveness makes it dense, but it remains the book most engineers reach for when they need a precise, authoritative treatment of a classic algorithm.'
    ],
    toc: ['Foundations', 'Sorting and Order Statistics', 'Data Structures', 'Advanced Design and Analysis Techniques', 'Advanced Data Structures', 'Graph Algorithms', 'Selected Topics', 'NP-Completeness'],
    tags: ['algorithms', 'data structures', 'computer science'],
    level: 'Advanced', publisher: 'MIT Press', language: 'English', format: 'PDF' },

  { id: 30, title: 'Man\'s Search for Meaning', author: 'V. Frankl', category: 'Philosophy', pages: 165, year: 1946, color: '#6B8F71',
    description: 'A psychiatrist\'s account of surviving Nazi concentration camps, and the theory of meaning-centered psychology he developed from it.',
    long: [
      'Viktor Frankl, a psychiatrist and Holocaust survivor, recounts his experience in Nazi concentration camps and the observations that led him to develop logotherapy — the idea that the primary human drive is not pleasure but the search for meaning.',
      'The first half is memoir; the second half outlines his psychological theory, arguing that meaning can be found even in suffering, through work, love, or the attitude one takes toward unavoidable hardship.',
      'It remains widely read both as a memoir of survival and as an introduction to existential psychology.'
    ],
    toc: ['Experiences in a Concentration Camp', 'Logotherapy in a Nutshell', 'The Case for a Tragic Optimism'],
    tags: ['psychology', 'memoir', 'meaning'],
    level: 'Beginner', publisher: 'Beacon Press', language: 'English (translated)', format: 'EPUB' }
]

const reviewNames = ['Dara P.', 'Sokha K.', 'Michael T.', 'Lina R.', 'Vuthy S.', 'Anna B.', 'James O.', 'Chenda M.']
const reviewLines = [
  'Clear and well organized — exactly what I needed for coursework.',
  'Took a while to get through but worth it in the end.',
  'One of the better books I\'ve read on this topic this year.',
  'Good introduction, though a few chapters felt dated.',
  'Recommended it to two classmates already.',
  'Dense in places but the core ideas really stuck with me.',
  'Not the easiest read, but the payoff is real.',
  'Solid overview — I keep coming back to reference it.'
]

function seededRand(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const enriched = base.map((b, i) => {
  const seed = b.id * 17
  const rating = Math.round((3.6 + seededRand(seed) * 1.3) * 10) / 10
  const ratingsCount = 40 + Math.floor(seededRand(seed + 1) * 260)
  const reviewCount = 2 + Math.floor(seededRand(seed + 2) * 3)
  const reviews = Array.from({ length: reviewCount }, (_, j) => {
    const rSeed = seed + 10 + j
    return {
      name: reviewNames[Math.floor(seededRand(rSeed) * reviewNames.length)],
      rating: Math.max(3, Math.min(5, Math.round(rating + (seededRand(rSeed + 1) - 0.5) * 2))),
      date: `2026-0${1 + Math.floor(seededRand(rSeed + 2) * 8)}-1${Math.floor(seededRand(rSeed + 3) * 9)}`,
      comment: reviewLines[Math.floor(seededRand(rSeed + 4) * reviewLines.length)]
    }
  })
  const digitalCopies = 3 + Math.floor(seededRand(seed + 30) * 6)
  const checkedOut = Math.floor(seededRand(seed + 31) * digitalCopies)
  const categoryPrefix = { Technology: 'QA76', Philosophy: 'B', Science: 'Q', Leadership: 'HD', Language: 'P', History: 'D', Other: 'BF' }[b.category] || 'Z'
  const price = Math.round((6.5 + seededRand(seed + 50) * 18) * 100) / 100
  const exchangeable = seededRand(seed + 51) > 0.35

  return {
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    pages: b.pages,
    year: b.year,
    spineColor: b.color,
    description: b.description,
    longDescription: b.long,
    tableOfContents: b.toc,
    tags: b.tags,
    subjects: b.tags.map(t => t.replace(/\b\w/g, c => c.toUpperCase())),
    callNumber: `${categoryPrefix}${100 + (b.id * 7) % 800}.${String.fromCharCode(65 + (b.id % 26))}${b.id}`,
    level: b.level,
    publisher: b.publisher,
    language: b.language,
    format: b.format,
    isbn: `978-${1000000000 + b.id * 7654321}`.slice(0, 13).replace(/(\d{3})(\d)(\d{3})(\d{3})(\d)/, '$1-$2-$3-$4-$5'),
    fileSizeMb: Math.round((b.pages / 90 + seededRand(seed + 40)) * 10) / 10,
    readingTimeHours: Math.round((b.pages / 45) * 10) / 10,
    addedDate: `2026-0${1 + (b.id % 8)}-0${1 + (b.id % 9)}`,
    edition: 1 + (b.id % 3),
    price,
    exchangeable,
    rating,
    ratingsCount,
    reviews,
    availability: {
      digitalCopies,
      checkedOut
    }
  }
})

writeFileSync(
  new URL('../data/books.json', import.meta.url),
  JSON.stringify(enriched, null, 2) + '\n'
)

console.log(`Wrote ${enriched.length} books to data/books.json`)
