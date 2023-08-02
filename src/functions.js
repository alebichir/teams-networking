function lock1(locked) {
  console.info("lock1");
  return locked;
}

function lock2(locked) {
  console.info("lock2");
  return locked;
}

var l1 = lock1(false);
var l2 = lock2(false);

if (l1 && l2) {
  console.info("we are ok");
} else {
  console.warn("we are not ok");
}

// const firstName = "a";

// function printInfo({ firstName }) {
//   //{firstName} = p;

//   console.info(p);
// }

// function printInfo(p) {}

// printInfo(firstName); // p ={firstName};

const person = {
  firstName: "Nicolae",
  lastName: "Matei",
  age: 24
};

// const firstName = person.firstName;
// const lastName = person.lastName;
const { firstName, lastName } = person;

// parameter Destructuring
function printInfo({ firstName }) {
  console.info("before", firstName); //Nicolae
  firstName = "changed"; // you can safety change it
  console.warn("after", firstName); //changed
}

printInfo(person);
console.info("firstName", person.firstName); //Nicolae
