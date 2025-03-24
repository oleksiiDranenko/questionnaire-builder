## Deployed App
[Deployed app](https://questionnaire-builder-j0pan7mgn-oleksiis-projects-fd6d492c.vercel.app)

I have used Next.js for the front end (client folder) and Node.js with Express and Mongoose for the back end (server folder). MongoDB serves as a database

I have completed everything from the **Base** and **Middle** levels (sorry, I have 'drag and drop' only for the questions) and **Infinite scroll pagination** and **General statistics** from the **Advanced** level.

---

## Base Level:
### Questionnaire Catalog Page
A page where users can observe the paginated list of available questionnaires. Each card consists of:
- Questionnaire name  
- Description  
- Number of questions  
- Number of completions  
- Actions: **Edit / Run / Delete**

### Questionnaire Builder Page
A page where users can create a questionnaire by adding multiple questions.  
Possible question types:
- **Text** – Free-form user input  
- **Single Choice** – User can select only one of the possible answers  
- **Multiple Choices** – User can select several answers  

### Interactive Questionnaire Page
A page where users can complete a questionnaire created earlier. At the end, the user can:
- See all their answers  
- View the time it took to complete the questionnaire  
- Submit their responses, which are then stored in the database  
- This page is accessible via the **"Run Quiz"** button  

---

## Middle Level:
### Questionnaire Catalog Page
- Ability to sort questionnaires by:  
  - Name  
  - Number of questions  
  - Number of completions  

### Questionnaire Builder Page
- **Drag and Drop** functionality: Allows users to reorder questions by dragging them  

### Interactive Questionnaire Page
- Saves intermediate completion state  
- If the user refreshes the page, they can continue from where they left off  

---

## Advanced Level:
### Questionnaire Catalog Page
- **Infinite Scroll Pagination**  
  - When a user scrolls down, more questionnaires load automatically  
  - I have added a **button** to toggle **infinite scroll pagination**  

### Questionnaire Statistics Page
- A page displaying **general statistics** for the questionnaire:
  - **Average completion time**  
  - **Number of completions per day** (**Bar chart**)  
  - **Average number of correct answers**  
