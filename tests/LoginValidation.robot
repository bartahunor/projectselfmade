*** Settings ***
Library           Selenium2Library

*** Test Cases ***
#REGISTER/LOGIN
Open register page
    Open Browser    http://localhost:3000/register.html    chrome
    Sleep    2s
    Title Should Be    Bejelentkezés - Érettségi Felkészítő
    [Teardown]    Close Browser

Login with empty fields
    Open Browser    http://localhost:3000/register.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=submit-btn    10s
    Scroll Element Into View    id=submit-btn
    Click Button    id=submit-btn
    Location Should Be    http://localhost:3000/register.html
    [Teardown]    Close Browser

Login with invalid email
    Open Browser    http://localhost:3000/register.html    chrome
    Sleep    2s
    Input Text    id=email    invalidemail
    Input Text    id=password    Fruzsina2006
    Wait Until Element Is Visible    id=submit-btn    10s
    Scroll Element Into View    id=submit-btn
    Click Button    id=submit-btn
    Sleep    1s
    Alert Should Be Present    Hibás email vagy jelszó!
    [Teardown]    Close Browser

Login with invalid password
    Open Browser    http://localhost:3000/register.html    chrome
    Sleep    2s
    Input Text    id=email    keseru.fruzsina@diak.szbi-pg.hu
    Input Text    id=password    invalidpassword
    Wait Until Element Is Visible    id=submit-btn    10s
    Scroll Element Into View    id=submit-btn
    Click Button    id=submit-btn
    Sleep    1s
    Alert Should Be Present    Hibás email vagy jelszó!
    [Teardown]    Close Browser

Login with valid credentials
    Open Browser    http://localhost:3000/register.html    chrome
    Sleep    2s
    Input Text    id=email     keseru.fruzsina@diak.szbi-pg.hu
    Input Text    id=password    Fruzsina2006
    Wait Until Element Is Visible    id=submit-btn    10s
    Scroll Element Into View    id=submit-btn
    Click Button    id=submit-btn
    Sleep    1s
    Location Should Be    http://localhost:3000/Profil.html
    [Teardown]    Close Browser
    

#HEADER
Logo clickable
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=logokep    10s
    Scroll Element Into View    id=logokep
    Click Image    id=logokep
    Location Should Be    http://localhost:3000/homepage.html
    [Teardown]    Close Browser

Tantargyak clickable
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=tant    10s
    Scroll Element Into View    id=tant
    Click Element    id=tant
    Sleep    2s
    Location Should Be    http://localhost:3000/homepage.html#tantargyak
    [Teardown]    Close Browser

#LÁBLÉC
Tantargyak Scroll
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s

    #Töri
    Wait Until Element Is Visible    id=toritan    10s
    Scroll Element Into View    id=toritan
    Click Element    id=toritan
    Sleep    2s
    Wait Until Element Is Visible    id=tantargyak    5s
    Element Should Be Visible    id=tantargyak

    #Irodalom
    Wait Until Element Is Visible    id=irodtan    10s
    Scroll Element Into View    id=irodtan
    Click Element    id=irodtan
    Sleep    2s
    Wait Until Element Is Visible    id=tantargyak    5s
    Element Should Be Visible    id=tantargyak

    #Biológia
    Wait Until Element Is Visible    id=bioltan    10s
    Scroll Element Into View    id=bioltan
    Click Element    id=bioltan
    Sleep    2s
    Wait Until Element Is Visible    id=tantargyak    5s
    Element Should Be Visible    id=tantargyak

    #Angol
    Wait Until Element Is Visible    id=angtan    10s
    Scroll Element Into View    id=angtan
    Click Element    id=angtan
    Sleep    2s
    Wait Until Element Is Visible    id=tantargyak    5s
    Element Should Be Visible    id=tantargyak
    [Teardown]    Close Browser

Jog, ASZF,Sutik clickable
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    #ÁSZF
    Wait Until Element Is Visible    id=aszf    10s
    Scroll Element Into View    id=aszf
    Click Element    id=aszf
    Sleep    1s
    Location Should Be    http://localhost:3000/data.html
    Wait Until Element Is Visible    id=logokep    10s
    Scroll Element Into View    id=logokep
    Click Image    id=logokep

    #Sütik
    Wait Until Element Is Visible    id=sutik     10s
    Scroll Element Into View    id=sutik
    Click Element    id=sutik
    Sleep    1s
    Location Should Be    http://localhost:3000/data.html
    Wait Until Element Is Visible    id=logokep    10s
    Scroll Element Into View    id=logokep
    Click Image    id=logokep

    #Adatkezelés
    Wait Until Element Is Visible    id=adat     10s
    Scroll Element Into View    id=adat
    Click Element    id=adat
    Sleep    1s
    Location Should Be    http://localhost:3000/data.html
    Wait Until Element Is Visible    id=logokep    10s
    Scroll Element Into View    id=logokep
    Click Image    id=logokep
    [Teardown]    Close Browser


#HOME PAGE
Open website and check title
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Title Should Be    Tudástér - Érettségizz Sikerrel!
    [Teardown]    Close Browser

Gyakorlasra fel button loged out user
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=gyakfel    10s
    Scroll Element Into View    id=gyakfel
    Click Element    id=gyakfel
    Location Should Be    http://localhost:3000/register.html
    [Teardown]    Close Browser

Register button loged out user
    Open Browser    http://localhost:3000/homepage.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=regisztracio    10s
    Scroll Element Into View    id=regisztracio 
    Click Element    id=regisztracio 
    Sleep    2s
    Location Should Be    http://localhost:3000/register.html
    [Teardown]    Close Browser

#DATA HTML
Open data.html and check title
    Open Browser    http://localhost:3000/data.html    chrome
    Sleep    2s
    Title Should Be    Tudástér - Adatkezelési Tájékoztató
    [Teardown]    Close Browser

Dokumnetum clikkable
    #ÁSZF
    Open Browser    http://localhost:3000/data.html    chrome
    Sleep    2s
    Wait Until Element Is Visible    id=aszfkatt    10s
    Scroll Element Into View    id=aszfkatt
    Click Element    id=aszfkatt
    Sleep    1s
    Page Should Contain Element    id=altalanos-szerzodesi-feltetelek

    #Adatkezelés
    Wait Until Element Is Visible    id=adatkatt    10s
    Scroll Element Into View    id=adatkatt
    Click Element    id=adatkatt
    Sleep    1s
    Page Should Contain Element    id=adatkezelesi-tajekoztato

    #Sütik
    Wait Until Element Is Visible    id=sutikatt    10s
    Scroll Element Into View    id=sutikatt
    Click Element    id=sutikatt
    Sleep    1s
    Page Should Contain Element    id=sutik
    [Teardown]    Close Browser


