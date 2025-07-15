import matplotlib.pyplot as plt 
import seaborn as sns 
import numpy as np 
import pandas as pd 
import tempfile
import mlflow


def plot_model_comparison(results:dict, log_to_mlflow:bool = True):

    plots = []

    for model,metrics in results.items():

        plots.append( {"Model":model , "Metric" : "Accuracy", "scores" : metrics["accuracy"]})
        plots.append({"Model" : model, "Metric" : "F1-score", "scores" : metrics["f1_score"]})

    plot_df = pd.DataFrame(plots)    

    sns.set_theme(style="darkgrid")

    plt.figure(figsize = (12,6))
    ax = sns.barplot(data=plot_df, x = "Model" , y= "scores", hue="Metric", palette="muted")

    for i in ax.patches:
        ax.annotate(f"{i.get_height(): .4f}" , (i.get_x() + i.get_width() / 2., i.get_height() ) , ha='center', va='bottom', fontsize=10, color='black')
    
    plt.title("Metric comparison of models")
    plt.xlabel("Models")
    plt.ylabel("Scores")
    plt.tight_layout() 

    if log_to_mlflow:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            plt.savefig(tmp.name)
            mlflow.log_artifact(tmp.name, artifact_path="plots")

    plt.show()



