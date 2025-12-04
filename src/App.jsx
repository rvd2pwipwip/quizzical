import { useState, useMemo } from "react";
import he from "he";
import clsx from "clsx";

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const score = selectedAnswers.filter(
    (answer, index) => answer === questions[index].correct_answer
  ).length;

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple"
      );
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

    if (loading) {
      return <div>Loading questions...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }
  };

  // WHY: Memoize randomized answer arrays to prevent re-randomization on every re-render.
  // Without useMemo, Math.random() would run on each render, causing answer order to change
  // when users select answers (which triggers state updates and re-renders).
  // HOW: useMemo caches the randomized arrays and only recalculates when 'questions' changes.
  // Returns an array where each element is a randomized answer array for that question index.
  /**
   * Memoized array of randomized answer choices for each question.
   *
   * @description Creates a randomized array of answers for each question by combining
   * the correct answer with incorrect answers and shuffling their order. The randomization
   * happens once when questions are loaded and remains stable across re-renders.
   *
   * @returns {Array<Array<string>>} An array where each element corresponds to a question
   * index and contains an array of randomized answer strings (correct + incorrect answers).
   * Returns empty array if questions are not loaded or empty.
   *
   * @example
   * // For question 0: ["Paris", "London", "Berlin", "Madrid"]
   * // randomizedAnswers[0] would be one of the possible random orders
   */
  const randomizedAnswers = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    return questions.map((item) => {
      const correctAnswer = item.correct_answer;
      const incorrectAnswers = item.incorrect_answers;
      const answerChoices = [...incorrectAnswers];
      const randomIndex = Math.floor(
        Math.random() * (answerChoices.length + 1)
      );
      answerChoices.splice(randomIndex, 0, correctAnswer);
      return answerChoices;
    });
  }, [questions]);

  const endGame = () => {
    setShowResults(true);
  };

  const newGame = () => {
    setShowResults(false);
    setSelectedAnswers([]);
    fetchQuestions();
  };

  const questionElements = questions
    ? questions.map((item, index) => {
        const handleAnswerClick = (answer, index) => {
          setSelectedAnswers((prevSelected) => {
            const newAnswers = [...prevSelected];
            newAnswers[index] = answer;
            return newAnswers;
          });
        };

        return (
          <section key={index} className="question-container">
            <h3 className="question">{he.decode(item.question)}</h3>
            <div className="answers">
              {randomizedAnswers[index]?.map((answer) => (
                <label
                  key={answer}
                  className={clsx("base-label", {
                    right:
                      showResults && answer === questions[index].correct_answer,
                    wrong:
                      showResults &&
                      selectedAnswers[index] === answer &&
                      answer !== questions[index].correct_answer,
                    unselected:
                      showResults &&
                      selectedAnswers[index] !== answer &&
                      answer !== questions[index].correct_answer,
                  })}
                >
                  {he.decode(answer)}
                  <input
                    type="radio"
                    name={index}
                    value={answer}
                    onChange={() => handleAnswerClick(answer, index)}
                    disabled={showResults}
                  />
                </label>
              ))}
            </div>
          </section>
        );
      })
    : null;

  return (
    <>
      {questions.length === 0 && (
        <>
          <h1>Quizzical</h1>
          <p>Test your knowledge with this quiz!</p>
          <button id="start-game-btn" onClick={fetchQuestions}>
            Start Quiz
          </button>
        </>
      )}
      {questions.length > 0 && (
        <>
          <div id="questions">{questionElements}</div>
          <section className="game-results">
            {showResults && (
              <h1 className="results-display">{`You scored ${score}/${questions.length} correct answers`}</h1>
            )}
            {!showResults && (
              <button id="check-answers-btn" onClick={endGame}>
                Check answers
              </button>
            )}
            {showResults && (
              <button id="play-again-btn" onClick={newGame}>
                Play again
              </button>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default App;
