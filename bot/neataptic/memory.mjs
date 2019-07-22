
export function Memory(capacity) {
  this.experiences = new Array(capacity);
  this.size = 0;
}

Memory.prototype.save = function(experience) {
  let capacity = this.experiences.length;
  let index = this.size;

  this.experiences[index % capacity] = experience;
  this.size++;
};

Memory.prototype.sample = function(batch) {
  let capacity = this.experiences.length;
  let size = this.size;

  if (size > capacity) {
    size = capacity;
  }

  if (size >= batch) {
    var batch = new Array(batch);

    for (let i = 0; i < batch.length; i++) {
      let index = Math.floor(Math.random() * size);
      batch[i] = this.experiences[index];
    }

    return batch;
  }
};

