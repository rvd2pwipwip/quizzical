# Quizzical App - Implementation Notes

**Course:** [Scrimba Learn React](https://scrimba.com/learn-react-c0e)  
**Design Reference:** [Figma Design](https://www.figma.com/design/JFLf00tBeBylJ3Iicv5ROq/Quizzical-App--Copy-?node-id=8-2&m=dev)

## Overview

This quiz application fetches questions from the Open Trivia Database API, displays them with randomized answer choices, allows users to select answers, and provides feedback on their performance. The app demonstrates core React concepts including state management, side effects, memoization, and conditional rendering.

---

## Setup

**Tech Stack:**
- React 19.2.0
- Vite (build tool)
- CSS (no framework)

**Key Dependencies:**
- `he` - HTML entity decoder (for API response formatting)
- `clsx` - Conditional className utility

The project uses Vite for fast development and hot module replacement. The setup is standard React + Vite boilerplate.

---

## Requirement 1: Two Screens (Start & Questions)

### Implementation

**Start Screen:**
```jsx
{questions.length === 0 && (
  <>
    <h1>Quizzical</h1>
    <p>Test your knowledge with this quiz!</p>
    <button id="start-game-btn" onClick={fetchQuestions}>
      Start Quiz
    </button>
  </>
)}
```

**Questions Screen:**
```jsx
{questions.length > 0 && (
  <>
    <div id="questions">{questionElements}</div>
    <section className="game-results">
      {/* Results and buttons */}
    </section>
  </>
)}
```

### Solution Analysis

**✅ Good:** Uses `questions.length` instead of truthy check. Empty arrays `[]` are truthy in JavaScript, so checking length is the correct approach.

**✅ Good:** Conditional rendering is clean and readable. Each screen is self-contained.

**💡 Note:** The start screen could be enhanced with a loading state during the initial fetch, but the current implementation works well for the requirements.

**Key Learning:** Understanding JavaScript truthiness - `[]` is truthy, so `!questions` would be `false` even with an empty array.

---

## Requirement 2: Pull 5 Questions from OTDB API

### Implementation

**API Fetch Function:**
```jsx
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
};
```

**State Management:**
```jsx
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedAnswers, setSelectedAnswers] = useState([]);
```

### Solution Analysis

**✅ Excellent:** Error handling is properly implemented with try/catch and error state.

**✅ Excellent:** Loading state management allows for future loading UI enhancements.

**✅ Good:** Initializes `selectedAnswers` array with `null` values matching question count - this is a smart approach for tracking selections by index.

**✅ Good:** Function is extracted and reusable - called both on initial load (via button) and in `newGame()` function.

**💡 Consideration:** The function includes early returns for loading/error states, but these are inside the function body rather than in the component render. This is a minor structural issue but doesn't affect functionality.

**Key Learning:** 
- Async/await pattern for API calls
- Proper error handling in React
- State initialization patterns
- Function extraction for reusability

---

## Requirement 3: Tally Correct Answers After "Check Answers" Clicked

### Implementation

**Score Calculation:**
```jsx
const score = selectedAnswers.filter(
  (answer, index) => answer === questions[index].correct_answer
).length;
```

**Answer Evaluation:**
```jsx
className={clsx("base-label", {
  right: showResults && answer === questions[index].correct_answer,
  wrong: showResults && 
         selectedAnswers[index] === answer && 
         answer !== questions[index].correct_answer,
  unselected: showResults && 
              selectedAnswers[index] !== answer && 
              answer !== questions[index].correct_answer,
})}
```

**Answer Selection Tracking:**
```jsx
const handleAnswerClick = (answer, index) => {
  setSelectedAnswers((prevSelected) => {
    const newAnswers = [...prevSelected];
    newAnswers[index] = answer;
    return newAnswers;
  });
};
```

**Results Display:**
```jsx
{showResults && (
  <h1 className="results-display">
    {`You scored ${score}/${questions.length} correct answers`}
  </h1>
)}
```

### Solution Analysis

**✅ Excellent:** Score calculation uses `filter()` with a clean comparison - very readable and efficient.

**✅ Excellent:** Using `clsx` for conditional classes is a professional approach. The logic correctly identifies:
- Correct answers (always show as "right" when results shown)
- Selected incorrect answers ("wrong")
- Unselected incorrect answers ("unselected")

**✅ Excellent:** Answer tracking by index (`selectedAnswers[index]`) is the correct approach. This allows direct comparison with `questions[index].correct_answer`.

**✅ Good:** Radio buttons are disabled after checking answers (`disabled={showResults}`) - prevents cheating and provides good UX.

**✅ Good:** Functional update pattern (`prevSelected => ...`) ensures state updates use the latest values, avoiding stale closure issues.

**💡 Advanced Technique:** The score is calculated as a derived value rather than stored state - this is efficient and follows React best practices. It recalculates on every render, but since it's a simple filter operation, this is perfectly fine.

**Key Learning:**
- Array methods (`filter`, `map`) for data manipulation
- Conditional styling with `clsx`
- State management patterns (functional updates)
- Derived state vs stored state

---

## Requirement 4: Styled & Polished

### CSS Architecture

**Reset Styles:** Uses Eric Meyer's CSS Reset for consistent cross-browser styling.

**Key Styling Decisions:**

1. **Answer Randomization with useMemo:**
```jsx
const randomizedAnswers = useMemo(() => {
  if (!questions || questions.length === 0) return [];
  return questions.map((item) => {
    // Randomization logic
  });
}, [questions]);
```

**✅ Excellent:** Using `useMemo` prevents answer order from changing on re-renders. This was a critical bug fix - without memoization, answers would shuffle every time state updated.

2. **HTML Entity Decoding:**
```jsx
{he.decode(item.question)}
{he.decode(answer)}
```

**✅ Excellent:** Using the `he` package to decode HTML entities from the API (like `&quot;`, `&#039;`) ensures proper display of special characters.

3. **CSS Specificity Management:**
```css
.base-label.right:has(input[type="radio"]:checked),
.base-label.right {
  background-color: #94d7a2;
  border-color: #94d7a2;
}
```

**✅ Good:** Properly handles CSS specificity to ensure evaluation classes override base styles. Uses `:has()` selector for modern browser support.

4. **Visual Feedback:**
- Green (`#94d7a2`) for correct answers
- Red (`#f8bcbc`) for incorrect selected answers
- Faded (opacity: 0.5) for unselected incorrect answers
- Blue highlight (`#d6dbf5`) for selected answers before evaluation

5. **Background Decorations:**
- SVG blobs positioned as background images (top-right and bottom-left)
- Adds visual interest without interfering with content

6. **Typography:**
- Inter font for UI elements (weights 400, 700)
- Karla font for body text
- Proper font-weight imports from Google Fonts

### Solution Analysis

**✅ Excellent:** The styling closely matches the Figma design with proper color scheme, spacing, and typography.

**✅ Good:** Responsive considerations with flexbox and proper gap spacing.

**✅ Good:** Accessibility considerations:
- Radio buttons properly grouped with `name` attribute
- Labels associated with inputs
- Disabled state properly handled

**✅ Excellent:** Code organization - CSS is well-structured with clear class names following BEM-like conventions.

**💡 Polish Details:**
- Cursor changes (`pointer` to `default`) when disabled
- Smooth visual transitions
- Proper spacing and alignment
- Clean, modern aesthetic

**Key Learning:**
- CSS specificity and selector strategies
- Memoization for performance optimization
- External package integration (`he`, `clsx`)
- Design system implementation

---

## Advanced Concepts Demonstrated

### 1. Memoization with useMemo
Prevents expensive recalculations and maintains stable randomized answer order.

### 2. Functional State Updates
Ensures state updates use the latest values, preventing bugs from stale closures.

### 3. Derived State
Score is calculated from `selectedAnswers` rather than stored separately - efficient and maintainable.

### 4. Conditional Rendering Patterns
Clean screen switching based on application state.

### 5. Error Handling
Proper try/catch with user-friendly error states.

---

## Code Quality Observations

**Strengths:**
- ✅ Clean, readable code structure
- ✅ Proper React patterns (hooks, state management)
- ✅ Good error handling
- ✅ Performance optimizations (useMemo)
- ✅ Accessibility considerations
- ✅ Professional styling approach

**Areas for Future Enhancement:**
- Could add loading spinner during API fetch
- Could implement question categories/difficulty selection
- Could add animations/transitions for better UX
- Could implement local storage for high scores
- Could add question shuffling option

---

## Conclusion

This implementation demonstrates solid understanding of React fundamentals:
- State management
- Side effects and API integration
- Performance optimization
- Conditional rendering
- Event handling
- Styling and UX considerations

The code follows React best practices and shows growth in understanding complex state interactions and performance considerations. The use of `useMemo` to solve the randomization bug shows good problem-solving skills.

**Overall Assessment:** Excellent work demonstrating both technical competence and attention to detail. The implementation goes beyond basic requirements with proper error handling, performance optimization, and polished styling.

