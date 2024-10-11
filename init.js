class User{ //class to displa user score
    constructor(score){
        this._score = score;
    }

    get score(){ //function to return user score
        return this._score;
    }

    set score(newScore) { // function to update the score
        this._score = newScore;
    }
}


class Quiz{
    constructor(){
        this.quizElement = document.querySelector('.quiz'); // Select the quiz using querySelector
        this.startingPageElement = document.getElementById('StartingPage'); // Select the starting page using its ID
        this.questionElement = document.getElementById('question'); // gets the question element by ID
        this.difficultyElement = document.getElementById('difficulty'); // Gets the difficulty element by ID
        this.choices = document.querySelectorAll('.quizbutton'); // get the buttons for the quiz by the class 
        this.allQuestions = [];
        this.currentQuestionIndex = 0;
        this.currentCategoryIndex = 0; // Index of what category we are currently in according to our array of categories
        this.selectedCategories = []; // list of categories chosen
        this.bindEvents();
    }

    bindEvents() { // used for starting and restarting the quiz
        const self = this;
        document.addEventListener('DOMContentLoaded', function () {
            const startButton = document.getElementById('start'); // get start button from its ID
            const restartButton = document.getElementById('restart'); // get restart button from its ID

            startButton.addEventListener('click', function () {
                console.log('Start button clicked!'); // Debugging line
                self.startingPageElement.style.display = 'none'; // Hide the starting page
                self.quizElement.style.display = 'flex'; // Show the quiz
                self.selectCategories(); // select 3 random categories
                self.fetchQuestions(); // fetch the questions
            });

            restartButton.addEventListener('click', function () {
                self.quizElement.style.display = 'none'; // hide the quiz
                self.startingPageElement.style.display = 'flex'; // show the starting page
                self.allQuestions = []; // Clear questions for a new game
                self.currentQuestionIndex = 0; // clear question index
                self.currentCategoryIndex = 0; // clear category index
            });
        });
    }

    selectCategories(){
        const categories = []
        for (let i = 9; i <= 32; i++){
            categories.push(i);
        }
        this.selectedCategories =[];
        while (this.selectedCategories.length < 3){
            const randomIndex = Math.floor(Math.random() * categories.length);
            const category = categories[randomIndex];
            if (!this.selectedCategories.includes(category)) {
                this.selectedCategories.push(category);
            }
        }
    }

    fetchQuestions(){
        const category = this.selectedCategories[this.currentCategoryIndex];

        // Get and update category title
        const categoryTitle = this.getCategoryTitle(category);
        document.getElementById('category').textContent = categoryTitle;

        const EasyUrl = `https://opentdb.com/api.php?amount=3&category=${category}&difficulty=easy&type=multiple`;
        const MediumUrl = `https://opentdb.com/api.php?amount=3&category=${category}&difficulty=medium&type=multiple`;
        const HardUrl = `https://opentdb.com/api.php?amount=3&category=${category}&difficulty=hard&type=multiple`;

        fetch(EasyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network Response error');
                }
                return response.json();
            })
            .then(data => {
                this.allQuestions = data.results; // Use arrow function to maintain context
                this.currentQuestionIndex = 0; // Reset question index
                this.loadQuestion(this.allQuestions[this.currentQuestionIndex]); // Load the first question
            })
            .catch(error => {
                console.error('Error in fetching question data:', error);
            });
    }

    getCategoryTitle(categoryId) {
        const categories = {
            9: 'General Knowledge',
            10: 'Entertainment: Books',
            11: 'Entertainment: Film',
            12: 'Entertainment: Music',
            13: 'Entertainment: Musicals & Theatres',
            14: 'Entertainment: Television',
            15: 'Entertainment: Video Games',
            16: 'Entertainment: Board Games',
            17: 'Science & Nature',
            18: 'Science: Computers',
            19: 'Science: Mathmatics',
            20: 'Mythology',
            21: 'Sports',
            22: 'Geography',
            23: 'History',
            24: 'Politics',
            25: 'Art',
            26: 'Celebrities',
            27: 'Animals',
            28: 'Vehicles',
            29: 'Entertainment: Comics',
            30: 'Science: Gadgets',
            31: 'Entertainment: Japanese Anime & Manga',
            32: 'Entertainment: Cartoon & Animations',
        };
        
        return categories[categoryId] || 'Unknown Category'; // Return title or default category if none are found
    }

    loadQuestion(questionData){
        const questionText = decodeHtml(questionData.question);  
        const answers = questionData.incorrect_answers.concat(questionData.correct_answer); // get incorrect answers

        shuffleArray(answers);

        this.questionElement.textContent = questionText;

        // Changes the text and color for the difficulty
        this.difficultyElement.textContent = questionData.difficulty.charAt(0).toUpperCase() + questionData.difficulty.slice(1);

        if (questionData.difficulty == 'easy'){ //make the background green
            this.difficultyElement.style.backgroundColor = '#00ff37';
            this.difficultyElement.style.borderColor = '#00ff37';
        }
        else if (questionData.difficulty =='medium') { //makes the background yellow
            this.difficultyElement.style.backgroundColor = '#e5ff00';
            this.difficultyElement.style.borderColor = '#e5ff00';
        }
        else if(questionData.difficulty == 'hard') { //makes the background red
            this.difficultyElement.style.backgroundColor = '#dd0101';
            this.difficultyElement.style.borderColor = '#dd0101';
        }

        this.choices.forEach((choice,index) => {
            choice.textContent = decodeHtml(answers[index]);
            choice.onclick = () => this.checkAnswer(answers[index] === questionData.correct_answer);
        });
    }

    checkAnswer(isCorrect) {
        const originalColor = this 
        if (isCorrect) {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < 3) {
                this.fetchNextQuestion(); // Fetch next question in the same difficulty
            } else {
                this.currentCategoryIndex++; // Move to the next category
                if (this.currentCategoryIndex < this.selectedCategories.length) {
                    this.fetchQuestions(); // Fetch questions for the next category
                } else {
                    this.endQuiz(); // End the quiz after a ll categories are completed
                }
            }
        } else {
            this.choices.style.backgroundColor = 'red';
            this.choices.style.borderColor = 'red';

            setTimeout(() => {
                this.questionElement.style.color = originalColor; // Reset color to original
                this.fetchQuestions(); // Fetch a new question of the same difficulty
            }, 3000); // lasts for 3 seconds
        }
    }

    fetchNextQuestion() {
        // Load next question based on the current difficulty level
        const currentDifficulty = this.currentQuestionIndex === 0 ? 'easy' :
                                  this.currentQuestionIndex === 1 ? 'medium' : 'hard';
        const nextUrl = `https://opentdb.com/api.php?amount=1&category=${this.selectedCategories[this.currentCategoryIndex]}&difficulty=${currentDifficulty}&type=multiple`;
        fetch(nextUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network Response error');
                return response.json();
            })
            .then(data => {
                this.allQuestions.push(data.results[0]); // Add the new question to the list
                this.loadQuestion(this.allQuestions[this.currentQuestionIndex]);
            })
            .catch(error => {
                console.error('Error fetching next question data:', error);
            });
    }

    endQuiz() {
        // End quiz logic
        console.log('Quiz ended.');
        // You can add functionality to display the score or any other message
    }
}

function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const quiz = new Quiz();