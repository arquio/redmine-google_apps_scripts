/*
 * Connector to Redmine from Google Apps Scripts platform.
 *
 * Copyright (c) 2011,2012 Emergya
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * Author: Alejandro Leiva <aleiva@emergya.com>
 * Author: Carlos Parra Camargo <cparra@emergya.com>
 *
 */

var SPREADSHEET_ID = '0AmZuCGHWHcqDdG9RdGVsXzl1T3E4SFlrd1BucTA2bHc'

function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menu_entries = [{name: "Costs 2011", functionName: "YearCost2011"},
                      {name: "Costs 2012", functionName: "YearCost2012"},
                      {name: "Expenses 2011", functionName: "YearExpenses2011"},
                      {name: "Expenses 2012", functionName: "YearExpenses2012"},
                      {name: "Incomes", functionName: "Incomes"}];
  ss.addMenu("Costs", menu_entries);
}

function Incomes () {
  
  // Example: get income from Dome project
  // var data = incomeProject(219);
  // Browser.msgBox("Total income: " + toEuro(data));
  
  //var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('data');
  if (!sheet) {
    sheet = ss.insertSheet('data');
  } else {
    sheet.clear();
  }
  
  //var sheet = ss.getActiveSheet();
  
  
  //var data = sheet.getDataRange().getValues();
  
  var offset = 0;
  
  // TODO: retrieve id projects
  var data = projectWithIncome();
  

  for (var i = 0; i < data.length; ++i) {
    var row = data[i];
    var project_id = row[0];
    if (project_id != '') {
      //var total_income = incomeProject(project_id);
      //sheet.getRange(i+1, 2).setValue(total_income);
      //incomePlanProject(project_id);
      
      var income_plan_project = incomePlanProject(project_id);
      
      if (income_plan_project[0]) {
        
        var info_project = infoProject(project_id);
        
        for (var j = 0; j < income_plan_project.length; j++) {
         
          sheet.getRange(i+1+offset, 1).setValue(info_project[0]);
          sheet.getRange(i+1+offset, 2).setValue(info_project[1]);
          sheet.getRange(i+1+offset, 3).setValue(info_project[2]);
          sheet.getRange(i+1+offset, 4).setValue(info_project[3]);
          sheet.getRange(i+1+offset, 5).setValue(income_plan_project[j]['bill_date']);
          sheet.getRange(i+1+offset, 6).setValue(toEuro(income_plan_project[j]['bill']));
          sheet.getRange(i+1+offset, 7).setValue(income_plan_project[j]['tax']);
          sheet.getRange(i+1+offset, 8).setValue(income_plan_project[j]['company']);
          if (income_plan_project[j]['status'] == 'Nueva') {
            sheet.getRange(i+1+offset, 9).setValue('Pendiente');
          } else {
            sheet.getRange(i+1+offset, 9).setValue(income_plan_project[j]['status']);
          }
                    
          offset += +1;
        }
        offset -= 1;
      }      
    }
  }

  Browser.msgBox("Done! incomes calculation.");

}


function YearCost2011 () {
  YearCost('2011');
}

function YearCost2012 () {
  YearCost('2012');
}

function YearCost(year) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 0; i < data.length; ++i) {
    var row = data[i];
    var project_id = row[0];
    if (project_id != '') {
      var total_amount = costProjectByYear(project_id, year);
      sheet.getRange(i+1, 2).setValue(total_amount);
    }
  }

  Browser.msgBox("Done! costs calculation.");
}

function YearExpenses2011 () {
  YearExpenses ('2011');
}

function YearExpenses2012 () {
  YearExpenses ('2012');
}

function YearExpenses (year) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 0; i < data.length; ++i) {
    var row = data[i];
    var project_id = row[0];
    if (project_id != '') {
      var expenses = expensesProjectByYear(project_id, year);
      sheet.getRange(i+1, 3).setValue(expenses[0]);
      sheet.getRange(i+1, 4).setValue(expenses[1]);
    }
  }

  Browser.msgBox("Done! expenses calculation");
}
