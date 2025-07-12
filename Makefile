MSG_1 = "Updated changes in main file"
BRANCH_1 = ak 
BRANCH_2 = api 
BRANCH_3 = ak_ml 


git-push_ak : 
			git add . 
			git commit -m ${MSG_1}
			git push origin ${BRANCH_1}

git-push_api : 
			git add . 
			git commit -m "Updated api "
			git push origin api 

git-push_ak_ml : 
			git add . 
			git commit -m "Updated ML files"
			git push origin ak_ml 


git_change_api: 
			git checkout ${BRANCH_2}

git_change_ak: 
			git checkout ${BRANCH_1}

git_change_ak_ml:
			git checkout ${BRANCH_3}


package: 
	pip install -r requirements.txt

upgrade :
	pip install --upgrade pip 
	