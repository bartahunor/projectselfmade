*** Settings ***
Library           Selenium2Library

*** Test Cases ***
Valid Login
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Close Browser