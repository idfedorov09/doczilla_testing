function addStudent() {
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var middleName = document.getElementById("middleName").value;
  var dob = document.getElementById("dob").value;
  var group = document.getElementById("group").value;

  var studentData = {
      "name": firstName,
      "second_name": lastName,
      "middle_name": middleName,
      "birthday": dob,
      "study_group": group
  };

  fetch('http://localhost:8001/students/api', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData)
  })
      .then(response => response.json())
      .then(data => {
          var table = document.getElementById("studentTable").getElementsByTagName('tbody')[0];
          var newRow = table.insertRow(table.rows.length);

          var cell1 = newRow.insertCell(0);
          var cell2 = newRow.insertCell(1);
          var cell3 = newRow.insertCell(2);
          var cell4 = newRow.insertCell(3);
          var cell5 = newRow.insertCell(4);
          var cell6 = newRow.insertCell(5);

          cell1.innerHTML = data.id;
          cell2.innerHTML = data.name;
          cell3.innerHTML = data.second_name;
          cell4.innerHTML = data.middle_name;
          cell5.innerHTML = data.birthday;
          cell6.innerHTML = data.study_group;
      })
      .catch(error => console.error('Error:', error));
}

function deleteStudent() {
  var deleteUniqueNumber = document.getElementById("deleteUniqueNumber").value;
  var table = document.getElementById("studentTable").getElementsByTagName('tbody')[0];

  fetch(`http://localhost:8001/students/api?id=${deleteUniqueNumber}`, {
      method: 'DELETE'
  })
      .then(response => {
          if (!response.ok) {
              console.error('Error:', response.statusText);
          }
          else {
              for (var i = 0; i < table.rows.length; i++) {
                  var currentRow = table.rows[i];
                  var uniqueNumberCell = currentRow.cells[0];
                  var currentUniqueNumber = uniqueNumberCell.innerHTML;

                  if (currentUniqueNumber == deleteUniqueNumber) {
                      table.deleteRow(i);
                      break;
                  }
              }
          }
      })
      .catch(error => console.error('Error:', error));
}

function getStudents() {
  fetch('http://localhost:8001/students/api')
      .then(response => response.json())
      .then(data => {
          var table = document.getElementById("studentTable").getElementsByTagName('tbody')[0];
          table.innerHTML = "";

          data.forEach(student => {
              var newRow = table.insertRow(table.rows.length);

              var cell1 = newRow.insertCell(0);
              var cell2 = newRow.insertCell(1);
              var cell3 = newRow.insertCell(2);
              var cell4 = newRow.insertCell(3);
              var cell5 = newRow.insertCell(4);
              var cell6 = newRow.insertCell(5);

              cell1.innerHTML = student.id;
              cell2.innerHTML = student.name;
              cell3.innerHTML = student.second_name;
              cell4.innerHTML = student.middle_name;
              cell5.innerHTML = student.birthday;
              cell6.innerHTML = student.study_group;
          });
      })
      .catch(error => console.error('Error:', error));
}

window.onload = getStudents;
