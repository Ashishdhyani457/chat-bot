
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { logo } from '@/assets'
// Simulating API call
const mockApiResponse = async (message) => {
  const API=import.meta.env.VITE_API_URL
  // console.log(API)
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  // const data={answer:`This is a mock response to: "${message}"`,sessionId:"123456"}
  // return data 
  const response = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: message , enableGaurdrails:true})
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data = await response.json();
  console.log(data);
  const parsedBody = JSON.parse(data.body);
  return parsedBody;
}

const FeedbackForm = ({ messageId, onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!feedback.trim()){
      onClose();
      return;
    }
    onSubmit(messageId, feedback)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <Input
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback"
        className="mb-2"
      />
      <div className="flex justify-end space-x-2">
        <Button type="submit" size="sm">Submit</Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Chatbot() {
  const [messages, setMessages] = useState([{ id: Date.now(), text: "Welcome to Ea Digital codes", sender: 'bot' }])
  const [input, setInput] = useState('')
  const [feedbackMessageId, setFeedbackMessageId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom()
      setShouldScroll(false)
    }
    // scrollToBottom()
    console.log(messages)
  }, [messages,shouldScroll])

  const handleSend = async () => {
    setTimeout(scrollToBottom, 0)
    if (!input.trim()) return

    const userMessage = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const loadingId = Date.now() + 1;
    setMessages(prevMessages => [...prevMessages, { id: loadingId, sender: 'bot', text: null, isLoading: true }])

    try {
      const botResponse = await mockApiResponse(input)
      const botMessage = { id: Date.now() + 1, text: botResponse.answer, sender: 'bot',sessionId:botResponse.sessionId }
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== loadingId))
      setMessages(prev => [...prev, botMessage])
      setShouldScroll(true)
    } catch (error) {
      console.error('Error fetching response:', error)
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== loadingId))
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I couldn't process your request.", sender: 'bot' }
      setMessages(prev => [...prev, errorMessage])
      setShouldScroll(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeDislike = (messageId, action) => {
    setMessages(prev => {
      const newMessages = prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, liked: action === 'like', disliked: action === 'dislike' }
          : msg
      )
      if (messageId === newMessages[newMessages.length - 1].id) {
        setTimeout(scrollToBottom, 0)
      }
      return newMessages
    })
    setFeedbackMessageId(messageId)
  }

  const handleFeedbackSubmit = (messageId, feedback) => {

    console.log(`Feedback for message ${messageId}: ${feedback}`)
    // Here you would typically send this feedback to your backend
  }
  const handleFeedbackClose=()=>{
    setFeedbackMessageId(null)
  }

  return (
    <Card className=" mt-5  w-full max-w-md mx-auto">
      <CardHeader className="bg-primary text-white flex flex-row p-4 rounded-t-lg" >
        <img src={logo} className='w-10 h-10 rounded-full' alt="" />
        <CardTitle className="w-full text-center text-lg">EA Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto mt-2">
        {messages.map(message => (
          <div key={message.id} className="mb-4">
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
              <div className={`p-2 max-w-[80%] break-words ${
                message.sender === 'user' ? 'bg-blue-500 text-white rounded-[20px_20px_1px_20px]' : 'bg-gray-200 rounded-[20px_20px_20px_1px]'
              }`}>
                
                 {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              ) : (
               
                 <div>{message.text}</div>
               
              )}
              </div>


            </div>
            {message.sender === 'bot' && !message.isLoading && (
              <div className="mt-1 flex justify-start">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleLikeDislike(message.id, 'like')}
                    className={message.liked ? 'text-green-500' : ''}
                    aria-label="Like message"
                  >
                    <ThumbsUp size={16} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleLikeDislike(message.id, 'dislike')}
                    className={message.disliked ? 'text-red-500' : ''}
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
      <CardFooter>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full space-x-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your message..."
          />
          <Button type="submit" disabled={isLoading}>
            <Send size={16} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}