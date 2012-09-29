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

var INCOME_TRACKER = 23;

// CMI related functions

function projectWithIncome() {
  
  var redmine = new Redmine();
  
  var projects = redmine.getProjects();
  
  var projects_with_income = [];
  
  for (var i in projects) {
    
    var project_id = redmine.translator.searchTag(projects[i], 'id').text;
    
    var project = redmine.getProjectWithTrackers(project_id);
    
    var project_trackers = redmine.translator.searchTag(project, 'trackers');
    
    for (k in project_trackers['childs']) {

      Logger.log(project_trackers['childs'][k]['tracker']);
      
      if (project_trackers['childs'][k]['tracker']['attributes']['name'] == 'Facturas') {
                
        var incomes = redmine.getIssuesByTracker(project_id, INCOME_TRACKER);
        
        for (var i in incomes) {
          if (incomes[i]) {
            projects_with_income.push([project_id]);
            break;
          }
        }
      } 
    }
  }
  
  return  projects_with_income;
}

function incomeProject(project_id) {

  var total_income = 0.0;
    
  var redmine = new Redmine();
  
  var data = redmine.getIssuesByTracker(project_id, INCOME_TRACKER);
  
  for (var i in data) {
    var custom_fields = redmine.translator.searchTag(data[i], 'custom_fields');
    var bill = custom_fields.childs[4].custom_field.childs[0].value.text;

    total_income += +(bill);
  }

  return total_income;
}

function incomePlanProject(project_id) {

  var incomePlan = [];
  var redmine = new Redmine();
  
  var data = redmine.getIssuesByTracker(project_id, INCOME_TRACKER);
  
  Logger.log('Issue:');
  Logger.log(data);
  
  for (var i in data) {
    
    var custom_fields = redmine.translator.searchTag(data[i], 'custom_fields');
    
    incomePlan[i] = {};
    
    incomePlan[i]['team_ok'] = custom_fields.childs[0].custom_field.childs[0].value.text;
    incomePlan[i]['bill_sold'] = custom_fields.childs[1].custom_field.childs[0].value.text;
    incomePlan[i]['bill_date_sold'] = custom_fields.childs[2].custom_field.childs[0].value.text;
    incomePlan[i]['payment_date_sold'] = custom_fields.childs[3].custom_field.childs[0].value.text;
    incomePlan[i]['bill'] = custom_fields.childs[4].custom_field.childs[0].value.text;
    incomePlan[i]['bill_date'] = custom_fields.childs[5].custom_field.childs[0].value.text;
    incomePlan[i]['payment_date'] = custom_fields.childs[6].custom_field.childs[0].value.text;
    incomePlan[i]['tax'] = custom_fields.childs[7].custom_field.childs[0].value.text;
    incomePlan[i]['company'] = custom_fields.childs[8].custom_field.childs[0].value.text;
    
    var status = redmine.translator.searchTag(data[i], 'status');
    
    incomePlan[i]['status'] = status['attributes']['name'];
    
  }
  
  return incomePlan;
}

function infoProject(project_id) {
  
  var info_project = [];
  var file = '';
  var description = '';
  var business_unit = '';
  
  var redmine = new Redmine();
  
  var data = redmine.getProject(project_id);
  var name = redmine.translator.searchTag(data, 'name').text;
  
  var custom_fields = redmine.translator.searchTag(data, 'custom_fields');
  var custom_fields_child = custom_fields['childs'];
  
  for (i in custom_fields_child) {
    
    var value = custom_fields_child[i]['custom_field']['childs'][0]['value']['text'];
    var tag = custom_fields_child[i]['custom_field']['attributes']['name'];
    
    if (value) {
      switch(tag) {
        case 'Expediente':
          file = value;
          break;
        case 'Descripción Facturación':
          description = value;
          break;
        case 'Unidad de Negocio':
          business_unit = value;
          break;
      }
    }
  }  
          
  return [file, name, description, business_unit];
}

function costProjectByYear(project_id, year) {

  var cost_table = {};
  var total_amount = 0.0;
  var redmine = new Redmine();

  var data = redmine.getTimeEntries(project_id);

  for (var i in data) {

    var spent_on = redmine.translator.searchTag(data[i], 'spent_on');
    var spent_on_text = spent_on.text;

    var te_year = spent_on_text.split('-')[0];

    if (te_year == year) {

      var cost = redmine.translator.searchTag(data[i], 'cost');
      var role = redmine.translator.searchTag(data[i], 'role');
      var cost_value = cost.text;
      var role_text = role.text;

      if (!cost.text)
        continue;

      cost_table[role_text] += +(cost_value);
      total_amount += +(cost_value);
    }
  }

  return total_amount;
}

function expensesProjectByYear(project_id, year) {

  var total_planned = 0.0;
  var total_spent = 0.0;
  var redmine = new Redmine();

  var data = redmine.getIssuesByTracker(project_id, '27');

  for (var i in data) {

    var start_date = redmine.translator.searchTag(data[i], 'start_date');
    var start_date_text = start_date.text;

    var te_year = start_date_text.split('-')[0];

    if (te_year == year) {

      var custom_fields = redmine.translator.searchTag(data[i], 'custom_fields');

      var initial = custom_fields.childs[0].custom_field.childs[0].value.text;
      var planned = custom_fields.childs[1].custom_field.childs[0].value.text;
      var spent = custom_fields.childs[2].custom_field.childs[0].value.text;

      total_planned += +(planned);
      total_spent += +(spent);
    }
  }

  return [total_planned, total_spent];
}
