
export function Memory(capacity) {
  this.experiences = new Array(capacity);
  this.size = 0;
}

Memory.prototype.save = function(experience) {
  let capacity = this.experiences.length;
  let size = this.size;

  if (experience instanceof Experience) {
    this.experiences[size % capacity] = experience;
    return ++this.size;
  }
};

Memory.prototype.sample = function(batch) {
  let capacity = this.experiences.length;
  let size = this.size;

  if (size >= batch) {
    var batch = new Array(batch);
    let length = Math.min(size, capacity);

    for (let i = 0; i < batch.length; i++) {
      let index = Math.floor(Math.random() * length);
      batch[i] = this.experiences[index];
    }

    return batch;
  }
};

export function Experience({ state, action, reward, next, final }) {
  this.state = state;
  this.action = action;
  this.reward = reward;
  this.next = next;
  this.final = final;
}

