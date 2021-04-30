# Labor Market Information (LMI) Scraping

# Overview
This project is a web scraping program that collects occupational projections and wage data from the Geographic Solutions Virtual LMI. 
Data is collected on a state level and a regional level. 
This project will automate the data collection process as it is shown in the video linked below. 

https://netorgft1947697-my.sharepoint.com/:v:/g/personal/dylan_ns4ed_com/EWh3-yDOpC5EuVJwMLSnwqwBZXpfd2Ec3ExLht4Sh2SKnA

# Technology & High-Level Process
The software is a desktop application that automates data collection using a headless version of Goolge Chrome (Chromium).
All components are written in Javascript/NodeJS and include:

    - Collection of state-level data (Occ. and Wage)
    - Collection of full region-level data (Occ. and Wage)
    - Parsing of full region-level data into individual regions (Occ. and Wage)
    - Merging of occupational and wage data (Not Yet Implemented)
    - Formatting region-level data to match state-level data (Not Yet Implemented)

# Installed Libraries
    
    - Puppeteer (Web scraping)
    - SheetJS js-xlsx (Excel parsing)

# Usage
The program webEpScraping.js currently collects state and regional occupation data and works by running the following command:

    node webEpScraping.js
 
 The code will traverse a JSON object named 'stateLevelLinks_GS.json' and will create a directory called 'Excel_Sheets' that will contain the 
 excel sheets with the state and regional data for occupation projections.
 
 The second program, 'parseRegionLvl.js' parses the regional-level data into separate excel files based on individual regions. The program works by running 
 it with a specified directory that is the abbrev. of the state that you are parsing the data from. An example for New Mexico is below:
 
    node parseRegionLvl.js NM
    
 This will parse the single excel sheet into separate sheets and place them in their own directory.
 
 # Unresolved Issues
 Currently the code for collecting state and regional data has the following unresolved issues:
 
    - State and regional data are not always aligned by time period
    - Regional data is collecting by filtering data strictly by the second filter option in the 'Geography Type' dropdown menu. This option is not always listed the same across different states.


# Notes
Puppeteer runs a headless Chrome instance in parallel with other applications. In other words, If you run the code for webEpScaping.js across all LMI links at once, Puppeteer 
will try to run all 50+ processes at once. This is a problem that is fixed with the wrapper function in webEpScraping.js that collects data two states at a time. 

Only certain states use Geographic Solutions (which is what the script is designed for) A link showing states that use Geographic Solutions is listed below 
(Only states with the 'Virtual LMI' listed as an integration have valid links for this script). Those links should be added to 'stateLevelLinks_Gs.json'.

https://www.geographicsolutions.com/company/clients#Client_Listings

