import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { logo } from "@/assets";
import { Bot, X } from "lucide-react";

const exitPhrases = [
  "bye",
  "ok thanks",
  "thanks",
  "thank you",
  "i am done",
  "good bye",
  "exit",
  "goodbye",
  "no",
  "no thanks",
  "ok bye",
  "bye bye",
  "ok bye bye",
  "ok byebye",
  "thanks bye",
  "thanks goodbye",
  "thanks bye bye",
  "thanks byebye",
  "thank you bye",
  "thank you goodbye",
  "thank you bye bye",
  "thank you byebye",
];

const greetingsPhrases = [
  "sure",
  "hello",
  "hi",
  "hey",
  "greetings",
  "good mornng",
  "good afternoon",
  "good evening",
];
const keywords = [
  "sorry, i am unable to assist you with this request",
  "sorry, i am unable to assist you with this request.",
];
const systemPromt =
  "You are a helpful AI assistant. Always respond in a friendly and concise manner.Your responses should be informative but brief. If you're unsure about something, admit it. \
    If the answer is not present in the search results, just say you do not have enough context to answer. \
    If the input is not present in the search results, just say you do not have enough context to answer. \
    If the question is not present in the search results, just say you do not have enough context to answer. \
    Now, please respond to the user's input:";
const API_KEY = import.meta.env.VITE_API_KEY_URL;
const response_API = import.meta.env.VITE_API_URL;
const feedback_API = import.meta.env.VITE_FEEDBACK_API_URL;
// Simulating API call
const apiResponse = async (message, sessionId) => {
  // console.log(API)
  // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  // const data={answer:`This is a mock response to: "${message}"`,sessionId:"123456"}
  // return data

  const promt = `${systemPromt}\n\nUser: ${message}\nAssistant:`;
  // console.log(promt)
  const response = await fetch(response_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      question: promt,
      enableGaurdrails: true,
      sessionId: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  // console.log(data);
  const parsedBody = JSON.parse(data.body);
  return parsedBody;
};

const submitFeedback = async (feedbackData) => {
  // console.log(feedbackData)
  try {
    const response = await fetch(feedback_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    // console.log('Feedback submitted successfully:', data)
    return data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

const FeedbackForm = ({ messageId, onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      onClose();
      return;
    }
    onSubmit(messageId, feedback);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <Input
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback"
        className="mb-2"
      />
      <div className="flex justify-end space-x-2">
        <Button type="submit" size="sm">
          Submit
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: Date.now(), text: "Welcome to Ea Digital codes", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [feedbackMessageId, setFeedbackMessageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const maxLength = 500;

  // const toggleCard = () => {
  //   setIsOpen(!isOpen);
  //   window.parent.postMessage('openBot', '*');
  // }
  const OpenBot= () => {
    setIsOpen(true);
    window.parent.postMessage('openBot', '*');
  }
  const closeBot= () => {
    setIsOpen(false);
    window.parent.postMessage('closeBot', '*');
  }
  
  

  const handleInputChange = (e) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setInput(value)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
      setShouldScroll(false);
    }
    // scrollToBottom()
    // console.log(messages)
  }, [messages, shouldScroll]);

  const handleSend = async () => {
    setTimeout(scrollToBottom, 0);
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingId = Date.now() + 1;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: loadingId, sender: "bot", text: null, isLoading: true },
    ]);

    try {
      if (greetingsPhrases.includes(input.toLowerCase().trim())) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        const botMessage = {
          id: Date.now() + 1,
          text: "Hello! How can I assist you today? For the most accurate support, please provide the complete game title and SKU. Please note that while I strive to offer accurate information, there may be occasional inaccuracies",
          sender: "bot",
        };
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== loadingId)
        );
        setMessages((prev) => [...prev, botMessage]);
      } else if (exitPhrases.includes(input.toLowerCase().trim())) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        const botMessage = {
          id: Date.now() + 1,
          text: "If you have any more questions, don’t hesitate to ask. Have a great day!",
          sender: "bot",
        };
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== loadingId)
        );
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botResponse = await apiResponse(input, sessionId);

        let botMessageText = botResponse.answer;

        // Check if the API response matches any of the keywords
        if (keywords.includes(botMessageText.toLowerCase().trim())) {
          botMessageText =
            "Unfortunately, I am unable to assist with your request at this time. For more effective support, please provide additional details or ask another question related to your order, SKU title, or platform. Please be aware that while I strive to provide helpful responses, they may not always be comprehensive or entirely accurate.";
        }
        const botMessage = {
          id: Date.now() + 1,
          text: botMessageText,
          sender: "bot",
          sessionId: botResponse.sessionId,
        };
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== loadingId)
        );
        setMessages((prev) => [...prev, botMessage]);
        setSessionId(botResponse.sessionId);
      }
      setShouldScroll(true);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== loadingId)
      );
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShouldScroll(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeDislike = (messageId, action) => {
    setMessages((prev) => {
      const newMessages = prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, liked: action === "like", disliked: action === "dislike" }
          : msg
      );
      if (messageId === newMessages[newMessages.length - 1].id) {
        setTimeout(scrollToBottom, 0);
      }
      return newMessages;
    });
    setFeedbackMessageId(messageId);
  };

  const handleFeedbackSubmit = async (messageId, additionalFeedback) => {
    const botMessage = messages.find((msg) => msg.id === messageId);
    const userMessage =
      messages[messages.findIndex((msg) => msg.id === messageId) - 1];

    if (!botMessage || !userMessage) {
      console.error("Could not find corresponding messages for feedback");
      return;
    }

    const feedbackData = {
      feedback_id: messageId.toString(),
      user_input: userMessage.text,
      llm_response: botMessage.text,
      feedback: botMessage.liked ? "1" : botMessage.disliked ? "0" : "",
      additional_feedback: additionalFeedback,
    };

    try {
      await submitFeedback(feedbackData);
      // console.log('Feedback submitted successfully')
      // You might want to update the UI to show that feedback was submitted successfully
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // You might want to show an error message to the user
    }

    // setFeedbackMessageId(null)
  };
  const handleFeedbackClose = () => {
    setFeedbackMessageId(null);
  };

  return (
    <div className={`fixed bottom-0 right-0 flex flex-col items-end ${isOpen?"w-full":""} max-w-md`}>
     { isOpen && <Card
        // className={" w-full max-w-md mx-auto transition-all duration-300 ease-in-out h-[100vh] max-h-[500px] flex flex-col"}
        className={" w-full max-w-md mx-auto transition-all duration-300 ease-in-out h-[500px] max-h-[500px] flex flex-col"}

      >
        <CardHeader className="bg-primary text-white flex flex-row p-4 rounded-t-lg bg-gradient-to-r from-[#49218E] to-[#43ADC4] shrink-0">
          <img src={logo} className="w-10 h-10 rounded-full" alt="" />
          <CardTitle className="w-[80%] text-center text-lg">
            EA Chatbot
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeBot}
            aria-label="Close bot assistant"
            id="close"
            className="hover:bg-[#2e7e90] hover:text-white transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto mt-2">
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 max-w-[80%] break-words ${
                    message.sender === "user"
                      ? "bg-[#43ADC4] text-white rounded-[20px_20px_1px_20px]"
                      : "bg-[#49218E] text-white rounded-[20px_20px_20px_1px]"
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  ) : (
                    <div>{message.text}</div>
                  )}
                </div>
              </div>
              {message.sender === "bot" && !message.isLoading && (
                <div className="mt-1 flex justify-start">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLikeDislike(message.id, "like")}
                      className={message.liked ? "text-green-500" : ""}
                      aria-label="Like message"
                    >
                      <ThumbsUp size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLikeDislike(message.id, "dislike")}
                      className={message.disliked ? "text-red-500" : ""}
                      aria-label="Dislike message"
                    >
                      <ThumbsDown size={16} />
                    </Button>
                  </div>
                </div>
              )}
              {feedbackMessageId === message.id && (
                <div className="mt-2">
                  <FeedbackForm
                    messageId={message.id}
                    onSubmit={handleFeedbackSubmit}
                    onClose={handleFeedbackClose}
                  />
                </div>
              )}
            </div>
          ))}
          {/* {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="p-2 rounded-lg bg-gray-200">
              Bot is typing...
            </div>
          </div>
         
        )} */}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="flex-col pt-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex w-full space-x-2"
          >
            <Input
              value={input}
              // onChange={(e) => setInput(e.target.value)}
              onChange={handleInputChange} 
              placeholder="Type your message..."
                className="flex-grow"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#43ADC4] hover:bg-[#49218E]"
            >
              <Send size={16} />
            </Button>
          </form>
          <div className="w-[70%] text-right text-sm text-gray-500 mt-1">
            {input.length}/{maxLength} characters
          </div>
        </CardFooter>
      </Card>}

      { !isOpen && <Button
      id="close"
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 bg-[#FE2121] text-primary-foreground hover:bg-[#a12f2f] hover:text-primary-foreground shadow-lg mt-1"
        onClick={OpenBot}
        aria-label={"Close bot assistant"}
      >
        <Bot className="h-6 w-6" />
      </Button>}
    </div>
  );
}
