Deployed app: questionnaire-builder-j0pan7mgn-oleksiis-projects-fd6d492c.vercel.app

I have completed everything from the Base and Middle level (sorry i have 'drag and drop' only for the questions) and Infinite scroll paganation and General statistics ftom the Advanced level.


Base level:

Questionnaire catalog page: page where users can observe the paginated list of
available questionnaires. Card should consist of:
- questionnaire name;
- description;
- amount of questions;
- amount of completions;
- actions: edit/run/delete

Questionnaire builder page: page where users can create a questionnaire by adding
multiple questions.
Possible question types:
- text - free-form user input;
- single choice - user can select only one of the possible answers;
- multiple choices - user can select several answers 

Interactive questionnaire page: page where users can complete the questionnaire
created earlier. At the end of the questionnaire the user can see all his answers and
the time it took to complete the questionnaire. Once the questionnaire is completed,
responses are stored in the database. This page is available by clicking
on the “Run Quiz” button



Middle level:

Questionnaire catalog page: ability to sort questionnaires by: name, amount of
questions, amount of completions.

Questionnaire builder page: has “drag and drop” functionality to allow user to
re-order questions by dragging them;

Interactive questionnaire page: saves intermediate completion state so that when the
user refreshes the page he can continue from where he left.




Advanced level:

Questionnaire catalog page: infinite scroll pagination (when a user scrolls the
page, it automatically loads more questionnaires). i have added a button to turn on the infinite scroll paganation functionality

Questionnaire statistics page: a page is displaying general statistics for the
questionnaire:
- average completion time;
- amount of completions per day (bar chart);
- average amount of correct answers