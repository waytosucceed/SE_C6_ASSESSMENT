var questions = [];
var i = 0;
var count = 0;
var score = 0;
var Ansgiven = []; // Store answers given by the user
var previousQuestionIndex = null; // Track the previously displayed question
var topicName = ''; // Variable to store the topic name
const submitSound =document.getElementById("submit-sound");

const uniqueKey = 40_6;


// Helper function to save data in local storage under the unique key
function saveToLocalStorage(key, value) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  storageData[key] = value;
  localStorage.setItem(uniqueKey, JSON.stringify(storageData));
}

// Helper function to get data from local storage under the unique key
function getFromLocalStorage(key) {
  let storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};
  return storageData[key];
}

fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Get the selected topic from the URL
    const urlParams = new URLSearchParams(window.location.search);
    topicName = urlParams.get('topic'); // Store topic name for later use

    // Find the questions for the selected topic
    const selectedTopic = data.topics.find(t => t.heading === topicName);

    if (selectedTopic) {
      questions = selectedTopic.questions; // Access the questions array for the selected topic
      count = questions.length;

      // Store total number of questions in localStorage
      saveToLocalStorage(topicName + '_totalQuestions', count);

      // Load the heading from the selected topic
      document.getElementById('heading').innerText = topicName || 'Default Heading'; // Set default heading if not provided
      loadButtons();
      loadQuestion(i);

      // Retrieve topics from localStorage using your helper function
      const storageData = JSON.parse(localStorage.getItem(uniqueKey)) || {};  // Retrieve full storage data
      const topics = storageData['topics'] || []; // Get topics from storage data

      // Check if the selected topic is already stored to avoid duplicates
      if (!topics.find(t => t.heading === topicName)) {
        topics.push(selectedTopic); // Add the selected topic to the topics array
        storageData['topics'] = topics; // Update storageData with the new topics array
        localStorage.setItem(uniqueKey, JSON.stringify(storageData)); // Save updated storage back to localStorage
      }
    } else {
      document.getElementById('heading').innerText = 'Topic not found';
      document.getElementById('buttonContainer').innerHTML = 'No questions available for this topic.';
    }
  });


function loadButtons() {
  var buttonContainer = document.getElementById("buttonContainer");
  buttonContainer.innerHTML = ""; // Clear previous buttons
  for (var j = 0; j < questions.length; j++) {
    var btn = document.createElement("button");
    btn.className = "btn btn-default smallbtn";
    btn.innerHTML = "Q" + (j + 1);
    btn.setAttribute("onclick", "abc(" + (j + 1) + ")");
   if (getFromLocalStorage(topicName + '_completed')) {
    btn.classList.add("disabled-btn");
    btn.disabled = true;
    // console.log("Topic Completed Status:", getFromLocalStorage(topicName + '_completed'));

  }

buttonContainer.appendChild(btn);
  }
  // Highlight the button for the current question
  highlightButton(i);
  // Update button styles based on answered questions
  updateButtonStyles();

}
let currentSound = null; // Variable to keep track of the currently playing sound
function checkAllInputBoxesAnswered() {
  const allAnswered = questions.every(q => !q.inputBox || Ansgiven[questions.indexOf(q)]); // Adjust as needed for answer tracking
  if (allAnswered) {
    document.getElementById("picdiv").classList.remove("col-md-12", "col-lg-12", "col-sm-12", "col-xs-12");
    document.getElementById("picdiv").classList.add("col-md-7", "col-lg-7", "col-sm-7", "col-xs-7");
  }
}

function loadQuestion(index) {
  var randomQuestion = questions[index];
  if (!randomQuestion) {
    console.error("No question found at index:", index);
    return;
  }

  // Set question text
  var questionElement = document.getElementById("question");
  questionElement.innerHTML = randomQuestion.question;

  // Check if there is a sound associated with the question
  if (randomQuestion.questionSound) {
    var soundButton = document.createElement("button");
    soundButton.className = "btn btn-sound";
    soundButton.innerText = "🔊 Play Sound";
    soundButton.onclick = function() {
      var sound = new Audio(randomQuestion.questionSound);
      sound.play();
    };
    questionElement.appendChild(soundButton);
  }

  // Get the options element
  var optionsElement = document.getElementById("options");
  optionsElement.innerHTML = ""; // Clear existing options

  // Check if question has inputBox (no options)
  if (randomQuestion.inputBox) {
    
    document.getElementById("picdiv").classList.add("picdiv");
    document.getElementById("picdiv").classList.remove("col-md-7");
    document.getElementById("picdiv").classList.remove("col-lg-7");
    document.getElementById("picdiv").classList.remove("col-sm-7");
    document.getElementById("picdiv").classList.remove("col-xs-7");
    document.getElementById("picdiv").classList.add("col-md-12");
    document.getElementById("picdiv").classList.add("col-lg-12");
    document.getElementById("picdiv").classList.add("col-sm-12");
    document.getElementById("picdiv").classList.add("col-xs-12");
    document.getElementById("questiondiv").classList.add("input");
    document.getElementById("question_background").classList.remove("img-responsive");
    document.getElementById("question_background").style.width='90%';
    document.getElementById("question_background").style.height='90%';
    document.getElementById("question_background").style.height='28em';
    document.getElementById("question").style.top='35%';
    document.getElementById("question").style.left='50%';
    const menu = document.getElementsByTagName("ul");
    if (menu.length > 0) {
        menu[0].style.display = 'flex';
        menu[0].style.fontSize= '3vw'; 
        menu[0].style.textAlign= 'center';
        menu[0].style.flexDirection= 'row';
        menu[0].style.justifyContent = 'center';
        menu[0].style.gap= '2%';// Set display of the first (or only) menu element
    }

   
    randomQuestion.inputBox.forEach((item, idx) => {
      if (item.operand === "" || item.operator === "") {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "answer-input";
        input.placeholder = "Enter value";
        input.value = Ansgiven[i] && Ansgiven[i][idx] ? Ansgiven[i][idx] : "";  // Pre-fill the input with the saved answer
        input.oninput = function() {
          // Do not automatically submit, just enable the submit button
          handleAnswerChange();
          checkAllInputBoxesAnswered();
        };
        optionsElement.appendChild(input);
      } else {
        var textNode = document.createTextNode(item.operand || item.operator);
        optionsElement.appendChild(textNode);
      }
    });
    
  } else if (randomQuestion.options) {
    var mainDiv = document.getElementsByClassName("maindiv")[0];

if (mainDiv) {
    mainDiv.style.display = 'flex';
} else {
    console.error('No element with class "maindiv" found');
}
document.getElementById("picdiv").classList.add("col-md-7");
document.getElementById("picdiv").classList.add("col-lg-7");
document.getElementById("picdiv").classList.add("col-sm-7");
document.getElementById("picdiv").classList.add("col-xs-7");
    document.getElementById("questiondiv").classList.remove("input");
    document.getElementById("picdiv").classList.remove("picdiv");
    document.getElementById("question_background").classList.add("img-responsive");
    document.getElementById("question_background").style.height='100%';
    document.getElementById("question").style.top='50%';
    document.getElementById("question").style.left='46%';
    // Display options if they exist
    var hasImageOptions = randomQuestion.options.some(option => option.image);
    var hasTextOnlyOptions = randomQuestion.options.every(option => !option.image);

    if (hasImageOptions) {
      optionsElement.classList.add("grid-layout");
      optionsElement.style.display="flex";
      optionsElement.style.flexDirection='row';
      optionsElement.classList.remove("text-only");
    } else if (hasTextOnlyOptions) {
      optionsElement.classList.add("text-only");
      optionsElement.style.display="block";
    }

    var selectedLi = null;
    randomQuestion.options.forEach(function(option, idx) {
      var li = document.createElement("li");
      li.classList.add("option-container");
      
      li.onclick = function() {
        if (selectedLi) {
          selectedLi.style.border = "";
          selectedLi.style.background = "none";
        }
        li.style.border = "3px solid";
        li.style.borderRadius = "8px";
        li.style.background = "#E2BFD9";
        selectedLi = li;
        // Do not submit here, only enable submit button
        handleAnswerChange();
      };

      var radioButton = document.createElement("input");
      radioButton.type = "radio";
      radioButton.name = "answer";
      radioButton.value = idx;
      radioButton.style.display = "none";

      if (option.image) {
        var optionImage = document.createElement("img");
        optionImage.src = option.image;
        optionImage.alt = "Option Image";
        optionImage.style.width = "100%";
        optionImage.style.cursor = "pointer";
        optionImage.style.borderRadius = "12px";

        optionImage.onclick = function() {
          radioButton.checked = true;
          // Enable the submit button only, do not submit yet
          handleAnswerChange();
        };
        li.appendChild(optionImage);
      } else {
        document.getElementById("questiondiv").classList.remove("input");
        var optionTextButton = document.createElement("button");
        optionTextButton.className = "btnOption btn btn-option";
        optionTextButton.innerHTML = option.text;
        optionTextButton.onclick = function() {
          radioButton.checked = true;
          // Enable the submit button only, do not submit yet
          handleAnswerChange();
        };
        li.appendChild(optionTextButton);
      }

      li.appendChild(radioButton);
      optionsElement.appendChild(li);
    });
  }

  // Restore previously selected answer if it exists
  var previouslySelected = Ansgiven[index];
  if (previouslySelected !== null && previouslySelected !== undefined) {
    var previouslySelectedElement = optionsElement.querySelector('input[name="answer"][value="' + previouslySelected + '"]');
    if (previouslySelectedElement) {
      previouslySelectedElement.checked = true;

      var previouslySelectedLi = previouslySelectedElement.closest('li');
      if (previouslySelectedLi) {
        previouslySelectedLi.style.border = "3px solid";
        previouslySelectedLi.style.borderRadius = "8px";
        selectedLi = previouslySelectedLi;
      }
    }
  }

  // Update button visibility and styles
  updateButtonVisibility();
  highlightButton(index);
  updateButtonStyles();
  updateButtonText();
}
// function loadQuestion(index) {
//   var randomQuestion = questions[index];
//   if (!randomQuestion) {
//     console.error("No question found at index:", index);
//     return;
//   }

//   // Set question text
//   var questionElement = document.getElementById("question");
//   questionElement.innerHTML = randomQuestion.question;

//   // Check if there is a sound associated with the question
//   if (randomQuestion.questionSound) {
//     var soundButton = document.createElement("button");
//     soundButton.className = "btn btn-sound";
//     soundButton.innerText = "🔊 Play Sound";
//     soundButton.onclick = function() {
//       var sound = new Audio(randomQuestion.questionSound);
//       sound.play();
//     };
//     questionElement.appendChild(soundButton);
//   }

//   // Get the options element
//   var optionsElement = document.getElementById("options");
//   optionsElement.innerHTML = ""; // Clear existing options

//   // Check if question has inputBox (no options)
//   if (randomQuestion.inputBox) {
    
//     document.getElementById("picdiv").classList.add("picdiv");
//     document.getElementById("picdiv").classList.remove("col-md-7");
//     document.getElementById("picdiv").classList.remove("col-lg-7");
//     document.getElementById("picdiv").classList.remove("col-sm-7");
//     document.getElementById("picdiv").classList.remove("col-xs-7");
//     document.getElementById("picdiv").classList.add("col-md-12");
//     document.getElementById("picdiv").classList.add("col-lg-12");
//     document.getElementById("picdiv").classList.add("col-sm-12");
//     document.getElementById("picdiv").classList.add("col-xs-12");
//     document.getElementById("questiondiv").classList.add("input");
//     document.getElementById("question_background").classList.remove("img-responsive");
//     document.getElementById("question_background").style.width='90%';
//     document.getElementById("question_background").style.height='90%';
//     document.getElementById("question_background").style.height='28em';
//     document.getElementById("question").style.top='35%';
//     document.getElementById("question").style.left='50%';
//     const menu = document.getElementsByTagName("ul");
//     if (menu.length > 0) {
//         menu[0].style.display = 'flex';
//         menu[0].style.fontSize= '2vw'; 
//         menu[0].style.textAlign= 'center';
//         menu[0].style.flexDirection= 'row';
//         menu[0].style.justifyContent = 'center';
//         menu[0].style.gap= '2%';
//     }

//     // Create a container to hold rows of input boxes
//     const inputContainer = document.createElement("div");
//     inputContainer.classList.add("input-container");

//     for (let i = 0; i < randomQuestion.inputBox.length; i += 2) {
//       // Create a new row div
//       const row = document.createElement("div");
//       row.className = "input-row";
//       row.style.display = "flex";
//       row.style.justifyContent = "center";
//       row.style.gap = "10px";
//       row.style.marginBottom = "10px";

//       // Create two input elements per row
//       for (let j = 0; j < 2; j++) {
//         if (i + j < randomQuestion.inputBox.length) {
//           var input = document.createElement("input");
//           input.type = "text";
//           input.className = "answer-input";
//           input.placeholder = "Enter value";
//           // Check if operand has a value, if so, set it, otherwise leave blank
//           input.value = randomQuestion.inputBox[i + j].operand ? randomQuestion.inputBox[i + j].operand : "";
//           input.oninput = function() {
//             // Enable the submit button only, do not submit automatically
//             handleAnswerChange();
//           };
//           row.appendChild(input);
//         }
//       }
//       inputContainer.appendChild(row);
//     }

//     optionsElement.appendChild(inputContainer);

//   } else if (randomQuestion.options) {
//         var mainDiv = document.getElementsByClassName("maindiv")[0];
    
//     if (mainDiv) {
//         mainDiv.style.display = 'flex';
//     } else {
//         console.error('No element with class "maindiv" found');
//      }
//      document.getElementById("picdiv").classList.add("col-md-7");
//      document.getElementById("picdiv").classList.add("col-lg-7");
//     document.getElementById("picdiv").classList.add("col-sm-7");
//     document.getElementById("picdiv").classList.add("col-xs-7");
//         document.getElementById("questiondiv").classList.remove("input");
//         document.getElementById("picdiv").classList.remove("picdiv");
//         document.getElementById("question_background").classList.add("img-responsive");
//         document.getElementById("question_background").style.height='100%';
//         document.getElementById("question").style.top='50%';
//         document.getElementById("question").style.left='46%';
//         // Display options if they exist
//         var hasImageOptions = randomQuestion.options.some(option => option.image);
//         var hasTextOnlyOptions = randomQuestion.options.every(option => !option.image);
    
//         if (hasImageOptions) {
//           optionsElement.classList.add("grid-layout");
//           optionsElement.style.display="flex";
//           optionsElement.style.flexDirection='row';
//           optionsElement.classList.remove("text-only");
//         } else if (hasTextOnlyOptions) {
//           optionsElement.classList.add("text-only");
//           optionsElement.style.display="block";
//         }
    
//         var selectedLi = null;
//         randomQuestion.options.forEach(function(option, idx) {
//           var li = document.createElement("li");
//           li.classList.add("option-container");
          
//           li.onclick = function() {
//             if (selectedLi) {
//               selectedLi.style.border = "";
//               selectedLi.style.background = "none";
//             }
//             li.style.border = "3px solid";
//             li.style.borderRadius = "8px";
//             li.style.background = "#E2BFD9";
//             selectedLi = li;
//             // Do not submit here, only enable submit button
//             handleAnswerChange();
//           };
    
//           var radioButton = document.createElement("input");
//           radioButton.type = "radio";
//           radioButton.name = "answer";
//           radioButton.value = idx;
//           radioButton.style.display = "none";
    
//           if (option.image) {
//             var optionImage = document.createElement("img");
//             optionImage.src = option.image;
//             optionImage.alt = "Option Image";
//             optionImage.style.width = "100%";
//             optionImage.style.cursor = "pointer";
//             optionImage.style.borderRadius = "12px";
    
//             optionImage.onclick = function() {
//               radioButton.checked = true;
//               // Enable the submit button only, do not submit yet
//               handleAnswerChange();
//             };
//             li.appendChild(optionImage);
//           } else {
//             document.getElementById("questiondiv").classList.remove("input");
//             var optionTextButton = document.createElement("button");
//             optionTextButton.className = "btnOption btn btn-option";
//             optionTextButton.innerHTML = option.text;
//             optionTextButton.onclick = function() {
//               radioButton.checked = true;
//               // Enable the submit button only, do not submit yet
//               handleAnswerChange();
//             };
//             li.appendChild(optionTextButton);
//           }
    
//           li.appendChild(radioButton);
//           optionsElement.appendChild(li);
//         });
//       }

//   // Restore previously selected answer if it exists
//   var previouslySelected = Ansgiven[index];
//   if (previouslySelected !== null && previouslySelected !== undefined) {
//     var previouslySelectedElement = optionsElement.querySelector('input[name="answer"][value="' + previouslySelected + '"]');
//     if (previouslySelectedElement) {
//       previouslySelectedElement.checked = true;

//       var previouslySelectedLi = previouslySelectedElement.closest('li');
//       if (previouslySelectedLi) {
//         previouslySelectedLi.style.border = "3px solid";
//         previouslySelectedLi.style.borderRadius = "8px";
//         selectedLi = previouslySelectedLi;
//       }
//     }
//   }

//   // Update button visibility and styles
//   updateButtonVisibility();
//   highlightButton(index);
//   updateButtonStyles();
//   updateButtonText();
// }



function playOptionSound(option) {
  var sound = new Audio(option);
  sound.play();
}


function playSound(soundFile) {
  var audio = new Audio(soundFile);
  audio.play();
}



// Save the answer for the current question
function saveCurrentAnswer() {
  // Get multiple-choice selected answer
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');

  // Check if it's a multiple-choice question
  if (selectedAnswer) {
    Ansgiven[i] = parseInt(selectedAnswer.value); // Store answer as an index
  } else {
    // For questions with input boxes, collect values from all inputs
    var inputFields = document.querySelectorAll('.answer-input');
    if (inputFields.length > 0) {
      // Check if all input fields are empty
      var allEmpty = Array.from(inputFields).every(input => input.value.trim() === "");

      if (allEmpty) {
        Ansgiven[i] = null; // Mark as not answered
      } else {
        // Save all non-empty input values
        Ansgiven[i] = Array.from(inputFields).map(input => input.value.trim() || null);
      }
    } else {
      Ansgiven[i] = null; // Mark as not answered if neither options nor inputs are present
    }
  }

  saveToLocalStorage('Ansgiven', Ansgiven); // Save the updated answers array to local storage
  updateButtonStyles(); // Ensure that button style is updated after submitting
}



function handleAnswerChange() {
  // Show the Submit Answer button and hide the Next button when an answer is selected
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";
}

function newques() {
  // Save the answer for the current question
  saveCurrentAnswer();

  if (i === count - 1) {
    // Display results
    displayResults();
    // Hide buttonContainer
    document.getElementById("buttonContainer").style.display = "none";
    document.getElementById("questiondiv").style.padding = "3rem";

    document.getElementById("questiondiv").style.backgroundColor = "#8FD8D2";
  
  } else {
    // Move to the next question
    i++;
    loadQuestion(i);
    document.getElementById("result").innerHTML = "";
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
    
    // Update button visibility and styles
    updateButtonVisibility();
    updateButtonStyles();
  }
}

function displayResults() {
  // Calculate the score based on saved answers
  score = Ansgiven.reduce((total, answer, index) => {
    if (questions[index].options) {
      // Multiple-choice question
      return answer === questions[index].answer ? total + 1 : total;
    } else {
      // Open-ended question with input boxes
      return (JSON.stringify(answer) === JSON.stringify(questions[index].answer)) ? total + 1 : total;
    }
  }, 0);

  console.log("score", score);

  // Save score and completion status to local storage
  saveToLocalStorage(topicName + '_score', score);
  saveToLocalStorage(topicName + '_completed', 'true'); // Mark topic as completed

  // Hide certain elements
  document.getElementById("question_background").style.display = "none";
  document.getElementById("question").style.display = "none";
  document.getElementById("nextbtn").style.display = "none";
  document.getElementById("result").style.display = "none";
  document.getElementById("options").style.display = "none";
  document.getElementById("head").innerHTML = "Check Your Answers";

  // Calculate percentage and feedback message
  var percentage = (score / questions.length) * 100;
  var progressBarColor = "";
  var feedbackMessage = "";
  if (percentage <= 40) {
    progressBarColor = "#F28D8D"; /* Dark Pastel Red */
    feedbackMessage = "You may need more practice.";
  } else if (percentage > 40 && percentage <= 70) {
    progressBarColor = "#6C8EBF"; /* Dark Pastel Blue */
    feedbackMessage = "Well done!";
  } else if (percentage > 70) {
    progressBarColor = "#B5E7A0"; /* Dark Pastel Green */
    feedbackMessage = "Excellent job!";
  }

  // Set up feedback section
  var mainDiv = document.getElementsByClassName("maindiv")[0];

if (mainDiv) {
    mainDiv.style.display = 'flex';
} else {
    console.error('No element with class "maindiv" found');
}
  document.getElementById("picdiv").classList.remove("col-md-12");
    document.getElementById("picdiv").classList.remove("col-lg-12");
    document.getElementById("picdiv").classList.remove("col-sm-12");
    document.getElementById("picdiv").classList.remove("col-xs-12");
  document.getElementById("picdiv").classList.add("col-md-7");
document.getElementById("picdiv").classList.add("col-lg-7");
document.getElementById("picdiv").classList.add("col-sm-7");
document.getElementById("picdiv").classList.add("col-xs-7");
  document.getElementById("picdiv").style.backgroundColor = "#B7A0D0"; /* Dark Pastel Lavender */
  document.getElementById("picdiv").style.fontSize = "1.8rem"; /* Larger font size for feedback */
  document.getElementById("picdiv").style.textAlign = "center";
  document.getElementById("picdiv").style.color = "#333"; /* Darker color for text */

  var Dis = "<br><br><br><br><br>Thank you for participating.<br><br>Score: " + score + "/" + questions.length + "<br><br>";
  var home = "<a href='index.html'><b class='btn btn-success next-btn-progress'>Next</b></a><br>";
  var content = Dis + feedbackMessage + "<br><div class='progress'> <div class='progress-bar' role='progressbar' aria-valuenow='" + percentage + "' aria-valuemin='0' aria-valuemax='100' style='width:" + percentage + "%;background-color:" + progressBarColor + ";'> </div></div>" + home;

  // Store the results content in local storage with a unique key
  saveToLocalStorage(topicName + '_results_content', content);

  // Prepare question and answer details
  var questionContent = "";
  document.getElementById("questiondiv").classList.remove("input");
  document.getElementById("questiondiv").style.textAlign = "left";
  document.getElementById("questiondiv").style.color = "black";
  document.getElementById("questiondiv").style.fontSize = "18px";
  document.getElementById("questiondiv").innerHTML = ""; // Clear previous content

  for (var j = 0; j < questions.length; j++) {
    var ques = questions[j].question;

    // Correct Answer handling for multiple-choice or open-ended questions
    var correctAnswer = questions[j].options ? 
      (questions[j].options[questions[j].answer].image ? 
        "<img src='" + questions[j].options[questions[j].answer].image + "' alt='Correct Answer Image' style='width:100px;height:auto;'/>" : 
        questions[j].options[questions[j].answer].text) : 
      questions[j].answer;

    var givenAnswer = Ansgiven[j];

    // For input box questions, compare the given answer with the correct answer
    if (questions[j].inputBox) {
      givenAnswer = givenAnswer && Array.isArray(givenAnswer) ? givenAnswer.join(", ") : "Not Answered";
      correctAnswer = questions[j].answer && Array.isArray(questions[j].answer) ? questions[j].answer.join(", ") : questions[j].answer;
    } else if (questions[j].options) {
      // Handle multiple choice questions
      givenAnswer = givenAnswer !== undefined && givenAnswer !== null ? 
                       (questions[j].options[givenAnswer].image ? 
                          "<img src='" + questions[j].options[givenAnswer].image + "' alt='Given Answer Image' style='width:100px;height:auto;'/>" : 
                          questions[j].options[givenAnswer].text) : 
                       "Not Answered";
    } else {
      // Handle any other question types
      givenAnswer = givenAnswer || "Not Answered";
    }
    
    // If answer is incorrect, mark it with red color
    if (givenAnswer !== correctAnswer) {
      givenAnswer = "<span style='color: red;'>" + givenAnswer + "</span>";
    }

    var num = j + 1;
    questionContent += "Q." + num + " " + questions[j].question + "<br>" + 
                       "Correct Answer: " + correctAnswer + "<br>" + 
                       "Answer Given: " + givenAnswer + "<br><br>";
  }

  // Store the question content in local storage with a unique key
  saveToLocalStorage(topicName + '_question_content', questionContent);

  // Display results
  document.getElementById("picdiv").innerHTML = content;
  document.getElementById("questiondiv").innerHTML = questionContent + home;
}



// Helper function to format answers
function formatAnswer(answer) {
  // if (answer.includes('.mp3')) {
  //     // Extract file name without extension
  //     return answer.split('/').pop().split('.').shift();
  // } else {
  //     return answer;
  // }
}



function checkAnswer() {
  submitSound.play();

  // Save the answer for the current question
  saveCurrentAnswer();
  
  // Hide submit button and show next button
  document.getElementById("subbtn").style.display = "none";
  document.getElementById("nextbtn").style.display = "inline-block";

  // Update the button styles to mark this question as answered
  updateButtonStyles();
}


function abc(x) {
  // Save the current answer before changing questions
  saveCurrentAnswer();
  i = x - 1;
  loadQuestion(i);
  document.getElementById("result").innerHTML = "";
  document.getElementById("subbtn").style.display = "inline-block";
  document.getElementById("nextbtn").style.display = "none";

  // Update button styles and visibility
  highlightButton(i);
  updateButtonStyles();
}


function updateButtonVisibility() {
  var selectedAnswer = document.querySelector('input[name="answer"]:checked');
  var textAreaAnswer = document.getElementById("answerTextArea");
  
  if (selectedAnswer || (textAreaAnswer && textAreaAnswer.value.trim() !== "")) {
    document.getElementById("subbtn").style.display = "inline-block";
    document.getElementById("nextbtn").style.display = "none";
  } else {
    document.getElementById("subbtn").style.display = "none";
    document.getElementById("nextbtn").style.display = "inline-block";
  }
}

function highlightButton(index) {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove highlight from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("highlighted-btn");
  }

  // Add highlight to the current button
  if (index >= 0 && index < buttons.length) {
    buttons[index].classList.add("highlighted-btn");
  }
}

function updateButtonStyles() {
  var buttonContainer = document.getElementById("buttonContainer");
  var buttons = buttonContainer.getElementsByTagName("button");

  // Remove "answered-btn" class from all buttons
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("answered-btn");
  }

  // Add "answered-btn" class only after the submit button is clicked
 // Add "answered-btn" class only after the submit button is clicked and input is not empty
 Ansgiven.forEach((answer, index) => {
  console.log("answer", answer)
  if (answer !== null && answer[0] !== null) {  // Ensure the answer is not null or empty
    console.log("not ")
    if (index >= 0 && index < buttons.length) {
      buttons[index].classList.add("answered-btn");
      console.log("added")
    }
  }
});
}


function updateButtonText() {
  var nextButton = document.getElementById("nextbtn");
  if (i === count - 1) {
    nextButton.innerHTML = "FINISH TEST";
    nextButton.onclick = function() {
      newques(); // Calls newques which will hide buttonContainer
    };
  } else {
    nextButton.innerHTML = "Next";
   
  }
}


