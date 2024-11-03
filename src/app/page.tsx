"use client";

import Link from "next/link";
import { type Key, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { generate_content, get_context } from "~/server/gemini";

export default function Page() {
  const [prompt, set_prompt] = useState("");
  const [is_loading, set_is_loading] = useState(false);

  const [context_labels, set_context_labels] = useState<string[]>([]);
  const [content, set_content] = useState<
    {
      type: "text-box" | "dropdown" | "bullet-list" | "link";
      content?: string | string[] | { header: string; content: string }[];
      header?: string;
      url?: string;
    }[]
  >([]);

  const [error_recursion_counter, set_error_recursion_counter] = useState(0);

  function submit_prompt() {
    get_context(prompt)
      .then((context_array) => {
        set_context_labels(context_array);
        generate_content(prompt, context_array)
          .then((content) => {
            set_content(content);
            set_prompt("");
            set_is_loading(false);
            set_context_labels([]);
            set_error_recursion_counter(0);
          })
          .catch((error) => {
            console.log(error);
            if (error_recursion_counter < 5) {
              set_error_recursion_counter(error_recursion_counter + 1);
              submit_prompt();
            }
          });
      })
      .catch((error) => {
        console.log(error);
        if (error_recursion_counter < 5) {
          set_error_recursion_counter(error_recursion_counter + 1);
          submit_prompt();
        }
      });
  }

  const renderContentItem = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: { type: any; content: any; header: any; url: any },
    index: Key | null | undefined,
  ) => {
    switch (item.type) {
      case "text-box":
        return (
          <div key={index} className="flex flex-col gap-2 pb-3 pt-3">
            {(item.content as string[]).map((paragraph, paragraphIndex) => (
              <div key={paragraphIndex}>{paragraph}</div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <Accordion type="single" collapsible key={index}>
            {/*eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(item.content as { header: string; content: any[] }[]).map(
              (dropdownItem, dropdownIndex) => (
                <AccordionItem
                  value={`item-${dropdownIndex}`}
                  key={dropdownIndex}
                >
                  <AccordionTrigger>{dropdownItem.header}</AccordionTrigger>
                  <AccordionContent>
                    {dropdownItem.content.map((nestedItem, nestedIndex) =>
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      renderContentItem(nestedItem, nestedIndex),
                    )}
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        );

      case "bullet-list":
        return (
          <div className="pb-3 pt-3" key={index}>
            <div>{item.header}</div>
            <ul>
              {(item.content as string[]).map((point, pointIndex) => (
                <li className="list-disc" key={pointIndex}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        );

      case "link":
        return (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          <Link href={item.url ?? ""} key={index}>
            <Button variant={"link"} className="text-blue-400">
              {item.content as string}
            </Button>
          </Link>
        );

      default:
        return <div key={index}></div>;
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col gap-12 p-4 md:p-96">
      <Link href={"https://github.com/davedude1011"} className="h-fit w-fit">
        <Avatar>
          <AvatarImage src="https://github.com/davedude1011.png" />
          <AvatarFallback>DD</AvatarFallback>
        </Avatar>
      </Link>
      <div>
        <div className="pb-2 text-center text-2xl font-bold md:text-6xl">
          Davedude101
        </div>
        {is_loading ? (
          <div className="animate-pulse text-center opacity-75">
            {context_labels.length > 0
              ? `Compiling [${context_labels.join(", ")}] Data...`
              : "Thinking about it..."}
          </div>
        ) : (
          <div className="text-center opacity-75">
            Ask me anything{" "}
            <span className="font-thin">
              about my projects, skills, or experience.
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Textarea
          disabled={is_loading}
          placeholder="What would you like to know?"
          value={prompt}
          onChange={(e) => {
            set_prompt(e.currentTarget.value);
          }}
        />
        <div className="flex flex-row gap-1 md:gap-4">
          <Button
            disabled={is_loading || prompt.length == 0}
            onClick={() => {
              set_is_loading(true);
              submit_prompt();
            }}
            className="px-2 text-xs md:px-4 md:text-sm"
          >
            Ask
          </Button>
          <Select
            disabled={is_loading}
            onValueChange={(value) => set_prompt(value)}
          >
            <SelectTrigger className="flex-grow cursor-default">
              <Button className="px-1 text-xs md:px-4 md:text-sm">
                <SelectValue placeholder="Examples" />
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="What tech-stack do you use?">
                  What tech-stack do you use?
                </SelectItem>
                <SelectItem value="What are some of your recent projects?">
                  What are some of your recent projects?
                </SelectItem>
                <SelectItem value="What languages do you know?">
                  What languages do you know?
                </SelectItem>
                <SelectItem value="What are your favourite pizza topings?">
                  What are your favourite pizza topings?
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {content.length > 0 && (
        <div className="flex flex-col">
          {content.map((contentItem, index) =>
            // @ts-expect-error um?
            renderContentItem(contentItem, index),
          )}
        </div>
      )}
    </div>
  );
}
