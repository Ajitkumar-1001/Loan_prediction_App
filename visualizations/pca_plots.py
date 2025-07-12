import matplotlib.pyplot as plt 
import seaborn as sns 
import numpy as np



def pca_scree_plot(pca, save_as = "scree_plot.png"):
    
    plt.figure(figsize=(12,12))
    sns.lineplot(np.cumsum(pca.explained_variance_ratio_), markers="o",linestyle= "--")
    plt.title("Scree plot of PCA Explained")
    plt.xlabel("No.of.components")
    plt.ylabel("Cumsum Variance Explained")
    plt.grid(True)
    plt.savefig(save_as)
    plt.close() 

    return save_as 


