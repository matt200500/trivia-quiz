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
        this.endingPageElement = document.getElementById('end'); // select the ending page and use its ID
        this.questionElement = document.getElementById('question'); // gets the question element by ID
        this.difficultyElement = document.getElementById('difficulty'); // Gets the difficulty element by ID
        this.choices = document.querySelectorAll('.quizbutton'); // get the buttons for the quiz by the class 
        this.restart = document.getElementById('restart'); // get restart button
        this.questionsLeft = 0; // number of remaining questions
        this.allQuestions = [];
        this.currentQuestionIndex = 0;
        this.currentCategoryIndex = 0; // Index of what category we are currently in according to our array of categories
        this.selectedCategories = []; // list of categories chosen
        this.currentDifficultyIndex = 0;
        this.questionsAnsweredInCategory = 0;
        this.bindEvents();
    }

    bindEvents() { // used for starting and restarting the quiz
        const self = this;
        document.addEventListener('DOMContentLoaded', function () {
            const startButton = document.getElementById('start'); // get start button from its ID
            const restartButton = document.getElementById('restart'); // get restart button from its ID

            startButton.addEventListener('click', function () {
                self.startingPageElement.style.display = 'none'; // Hide the starting page
                self.quizElement.style.display = 'flex'; // Show the quiz
                self.selectCategories(); // select 3 random categories
                self.questionsLeft = self.selectedCategories.length * 3; // number of questions equal to categories * 3
                self.fetchQuestions(); // fetch the questions
            });

            restartButton.addEventListener('click', function () {
                self.quizElement.style.display = 'none'; // hide the quiz
                self.startingPageElement.style.display = 'flex'; // show the starting page
                self.restart.style.display = 'none'; //hide restart button
                self.allQuestions = []; // Clear questions for a new game
                self.questionsLeft = 0; // reset questions left
                self.currentQuestionIndex = 0; // clear question index
                self.currentCategoryIndex = 0; // clear category index
                self.currentDifficultyIndex = 0; // clear current difficulty index
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
        console.log('Selected Categories:', this.selectedCategories); // Debugging log
    }

    fetchQuestions(){
        const category = this.selectedCategories[this.currentCategoryIndex];

        // Get and update category title
        const categoryTitle = this.getCategoryTitle(category);
        document.getElementById('category').textContent = categoryTitle;

        let difficulty;
        if (this.currentDifficultyIndex === 0){
            difficulty = 'easy';
        }
        else if (this.currentDifficultyIndex === 1) {
            difficulty = 'medium';
        }
        else if (this.currentDifficultyIndex === 2) {
            difficulty = 'hard';
        }
        
        const url = `https://opentdb.com/api.php?amount=3&category=${category}&difficulty=${difficulty}&type=multiple`;

        fetch(url)
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

        document.getElementById('questionsleft').textContent = this.questionsLeft;

        // Get and update the question
        document.getElementById('question').textContent = questionText;

        // Changes the text and color for the difficulty
        this.difficultyElement.textContent = questionData.difficulty.charAt(0).toUpperCase() + questionData.difficulty.slice(1);

        if (questionData.difficulty === 'easy'){ //make the background green
            this.difficultyElement.style.backgroundColor = '#00ff37';
            this.difficultyElement.style.borderColor = '#00ff37';
        }
        else if (questionData.difficulty ==='medium') { //makes the background yellow
            this.difficultyElement.style.backgroundColor = '#e5ff00';
            this.difficultyElement.style.borderColor = '#e5ff00';
        }
        else if(questionData.difficulty === 'hard') { //makes the background red
            this.difficultyElement.style.backgroundColor = '#dd0101';
            this.difficultyElement.style.borderColor = '#dd0101';
        }

        this.choices.forEach((choice, index) => {
            choice.textContent = decodeHtml(answers[index]);
            choice.onclick = () => this.checkAnswer(answers[index] === questionData.correct_answer);
        });
    }

    checkAnswer(selectedAnswerIsCorrect) {
        const correctAnswer = this.allQuestions[this.currentQuestionIndex].correct_answer;
    
        // Highlight the answers to the questions based off of correctness
        this.choices.forEach((choice) => {
            // Highlight the correct answer in green
            if (choice.textContent === correctAnswer) {

                choice.style.backgroundColor = 'green';
                choice.style.borderColor = 'green';
            }
            // Highlight the incorrect answers red
            if (!selectedAnswerIsCorrect && choice.style.backgroundColor === '') {
                choice.style.backgroundColor = 'red';
                choice.style.borderColor = 'red';
            }
        });
    
        // Reset colors after 3 seconds and move on to the next question
        setTimeout(() => {
            this.choices.forEach((choice) => { // reset each answer back to the original color
                choice.style.backgroundColor = '';
                choice.style.borderColor = '';
            });
    
            this.questionsAnsweredInCategory++; // increase number of questions answered in the given category
            this.currentQuestionIndex++; // move to next question
            this.questionsLeft--; // decrase number of questions left
    
            if (this.currentQuestionIndex < 3) { // if fewer than 3 questions were answered
                if (this.currentQuestionIndex < this.allQuestions.length) {
                    this.loadQuestion(this.allQuestions[this.currentQuestionIndex]); // get next question
                }
            } else {
                this.questionsAnsweredInCategory = 0; // Reset the counter of questions answered in the category
                this.currentCategoryIndex++; // go to the next category
                this.currentDifficultyIndex = 0; // reset difficulty
                if (this.currentCategoryIndex < this.selectedCategories.length) {
                    this.fetchQuestions(); // fetch questions for the next category
                } else {
                    this.endQuiz(); // end quiz if no categories are left
                }
            }
        }, 3000); // lasts for 3 seconds
    }
    
    endQuiz() {
        this.endingPageElement.style.display = 'flex'; // Show the ending page
        this.startingPageElement.style.display = 'none'; // Hide the starting page
        this.quizElement.style.display = 'none'; // Hide the quiz
        this.restart.style.display ='flex' //show the restart button
    }
    

    fetchNextQuestion() {
        // Load next question based on the current difficulty level
        const currentDifficulty = this.currentDifficultyIndex === 0 ? 'easy' :
                                  this.currentDifficultyIndex === 1 ? 'medium' : 'hard';
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