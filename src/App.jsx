import { useState, useEffect } from "react";
import he from "he";

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("https://opentdb.com/api.php?amount=5");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data.results);
        setSelectedAnswers(data.results.map(() => null));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const questionElements = questions
    ? questions.map((item, index) => {
        const correctAnswer = item.correct_answer;
        const incorrectAnswers = item.incorrect_answers;

        const combineAndRandomizeAnswers = (
          correctAnswer,
          incorrectAnswers
        ) => {
          const answerChoices = [...incorrectAnswers];
          const randomIndex = Math.floor(
            Math.random() * (answerChoices.length + 1)
          );
          answerChoices.splice(randomIndex, 0, correctAnswer);
          return answerChoices;
        };

        const handleAnswerClick = (answer, index) => {
          setSelectedAnswers((prevSelected) => {
            const newAnswers = [...prevSelected];
            newAnswers[index] = answer;
            console.log(newAnswers);
            return newAnswers;
          });
        };

        return (
          <section key={index}>
            <h3 className="question">{he.decode(item.question)}</h3>
            {combineAndRandomizeAnswers(correctAnswer, incorrectAnswers).map(
              (answer) => (
                <label key={answer}>
                  {he.decode(answer)}
                  <input
                    type="radio"
                    name={index}
                    value={answer}
                    onChange={() => handleAnswerClick(answer, index)}
                  />
                </label>
              )
            )}
          </section>
        );
      })
    : null;

  return (
    <>
      <h1>Quizzical</h1>
      {questionElements}
    </>
  );
}

export default App;
