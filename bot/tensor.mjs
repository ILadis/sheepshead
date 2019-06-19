
export function Tensor() {
  this.states = new Array();
}

Tensor.prototype.append = function(slots) {
  let states = new Array(slots);
  states.fill(0);

  let index = 0;
  states.next = (value) => {
    states[index++] = value;
  };

  states.commit = () => {
    for (let value of states) {
      this.states.push(value);
    }
  };

  return states;
};

