"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";

// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function get_context(prompt: string): Promise<string[]> {
    console.log(process.env.GEMINI_API_KEY)
    const gemini_prompt = 'YOU WILL BE GIVEN A PROMPT, THEN RESPOND WITH A JSON ARRAY OF CONTEXT CATAGORIES SPECIFICLY LINKING TO THE PROMPT FROM THIS LIST: ["tech-stack", "languages", "projects", "personal information"], YOUR RESPONSE MUST BE ONLY THE ARRAY NO FORMATTING OR WHITESPACE. PROMPT: ' + prompt

    const result = (await model.generateContent(gemini_prompt)).response.text();

    console.log(result)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(result)
}

// ["tech-stack", "languages", "projects", "personal information", "education"]
const DATA: Record<string, string> = {
    "tech-stack": "I currently use t3-app for fullstack next.js web development, which i used to create this site. I used to use Vite before i started doing next.js backend stuff.",
    "languages": "My main languages are (Typescript, React, HTML, CSS, JS, Python, C++), although im mainly into web-dev so TS, React and nextjs (with t3-app)",
    "projects": JSON.stringify([
        JSON.stringify([
            "Amadeus Revision: This AI-driven revision application enables users to input topics they wish to study, generating flashcards, multiple-choice questions, and long-form questions for effective learning. Built with React, TypeScript, and Next.js using the T3 stack, it offers a user-friendly interface to enhance revision.",
            "Website: https://amadeus-revision.vercel.app/",
            "GitHub: https://github.com/davedude1011/amadeus",
        ]),
        JSON.stringify([
            "Task-Tackler: A feature-rich Chrome extension designed to enhance the functionality of various homework websites. It incorporates tools like calculators, auto-completion for assignments, and integrated AI chatbots. The project boasts over 1,000 downloads on the Chrome Web Store and includes a dashboard site with user authentication and subscription features, built using T3 app technology.",
            "Website: https://task-tackler.com",
            "GitHub: https://github.com/davedude1011/task-tackler-new",
            "Dashboard GitHub: https://github.com/davedude1011/task-tackler-website",
        ]),
        JSON.stringify([
            "RccRevision: A full-stack revision platform tailored for GCSE students, offering a wide array of resources including past papers, podcasts, and integrated chatbots. User authentication is managed through Clerk sign-ins, providing a secure environment for users to access study materials.",
            "Website: https://www.rccrevision.com/",
            "GitHub: https://github.com/davedude1011/rccrevision",
        ]),
        JSON.stringify([
            "ArcMania: An AI-powered RPG game that allows players to save their global inventory across sessions. The game leverages AI for character creation, world-building, and item management, all supported through Clerk logins to ensure a seamless user experience.",
            "Website: https://arcmania.vercel.app/",
            "GitHub: https://github.com/davedude1011/arcmania",
        ]),
        JSON.stringify([
            "Hangman: An innovative AI-powered version of the classic hangman game, where the AI maintains character consistency throughout gameplay. This project represents my first venture into AI web applications using Gemini technology and is built with Next.js and React.",
            "Website: https://hangman-beta-silk.vercel.app/",
            "GitHub: https://github.com/davedude1011/hangman",
        ]),
        JSON.stringify([
            "StockSim: A virtual stock simulation game that enables users to engage with virtual stocks, buy and sell shares, and view graphical representations of stock performance. Developed with Vite, this project predates my more recent work but serves as a foundational experience in web development.",
            "Website: https://davedude1011.github.io/stocksim/",
            "GitHub: https://github.com/davedude1011/stocksim",
        ])
    ]),
    "personal information": "I am an enthusiastic web developer specializing in full-stack applications using technologies like TypeScript, React, and Next.js with the T3 stack. With a strong interest in AI integration, Ive built various projects that enhance user experiences. In addition to coding, I enjoy exploring new programming languages and keeping up with the latest tech trends. Im currently focused on creating innovative solutions to improve educational tools and interactive applications."
}
function get_prompt_extension_string(context_array: string[]) {
    const extension_array = []
    for (const context_string of context_array) {
        try {
            extension_array.push([context_string.toUpperCase(), DATA[context_string]])
        }
        catch {}
    }
    return JSON.stringify(extension_array)
}

//[ { "type":"text-box","content":string[] },{ "type":"dropdown","header":"","content":string[] },{ "type":"bullet-list","content":string[] },{ "type":"link","content":"","url":"" },{ "type":"gap" } ]
export async function generate_content(prompt: string, context_array: string[]): Promise<{type: "text-box"|"dropdown"|"bullet-list"|"link", content?: string|string[]|{header: string, content: string}[], header?: string, url?: string}[]> {
    const prompt_extension_string: string = get_prompt_extension_string(context_array)
    const prompt_structure_extension_string = 'STRUCTURE RESPONSE AS AN ARRAY OF OBJECTS WITH THE TYPES BELOW. INCLUDE MULTIPLE ENTRIES UNLESS TOLD OTHERWISE. TRY TO INCLUDE DROPDOWNS. RESPONSE SHOULD ONLY BE THE ARRAY, NO FORMATTING OR WHITESPACE, NO HTML OR MARKDOWN STYLING ONLY PLAIN TEXT FOR CONTENT: [{ "type": "text-box", "content": string[] }, { "type": "dropdown", "content": [{ "header": string, "content": [{ "type": "text-box", "content": string[] }, { "type": "dropdown", "content": [/* Recursive structure */] }, { "type": "link", "content": string, "url": string }] }] }, { "type": "link", "content": string, "url": string }] ENSURE CONTENT IS RELEVANT AND MEANINGFUL.' //,{ "type":"bullet-list","header": string,"content":string[] }
    const gemini_prompt = `${prompt_structure_extension_string}. CONTEXT DATA: ${prompt_extension_string}. MAKE SURE TO ORDER THE ITEMS IN THE ORDER THE USER SHOULD READ THEM. PROMPT: ${prompt}.`
    
    const result = (await model.generateContent(gemini_prompt)).response.text();

    console.log(result)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(result)
}