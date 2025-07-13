MSG_1 = "Updated changes in main file"
BRANCH_1 = ak 
BRANCH_2 = api 
BRANCH_3 = ak_ml 

MSG_3 = "debugged package code for feature extraction"

git-push1: 
			git add	. 
			git commit -m ${MSG_1}
			git push origin ${BRANCH_1}

git-push2: 
			git add	. 
			git commit -m "Updated api "
			git push origin api 

git-push3: 
			git add	. 
			git commit -m ${MSG_3}
			git push origin ${BRANCH_3}


git_change2: 
			git checkout ${BRANCH_2}

git_change1: 
			git checkout ${BRANCH_1}

git_change3:
			git checkout ${BRANCH_3}


package: 
	pip install -r requirements.txt

upgrade :
	pip install --upgrade pip 


venv12: 
	python3.12 -m venv Loan_App
	source Loan_App/bin/activate 

venv11: 
	python3.11 -m venv Loan_APP
	source Loan_APP/bin/activate 



