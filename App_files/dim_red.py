import os 
import pandas as pd 
import numpy as np 
from sklearn.decomposition import PCA 
from sklearn.preprocessing import StandardScaler 

from config import config 
import yaml 


def pca(X,n_components = None):
    assert n_components is not None 
    assert n_components > 1 

    scaler = StandardScaler() 
    scaled_input = scaler.fit_transform(X)

    Pca = PCA(n_components=n_components)
    X_Pca = Pca.fit_transform(scaled_input)

    return Pca, X_Pca





