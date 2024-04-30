

import fs from 'fs'
import jsonfile from 'jsonfile'

function* getAllCombinationsGenerator(arrays) {
    const stack = [];
    const currentSelection = [];
  
    function* iterate(currentIndex) {
      if (currentIndex === arrays.length) {
        yield currentSelection.slice();
        return;
      }
  
      for (let i = 0; i < arrays[currentIndex].length; i++) {
        currentSelection.push(arrays[currentIndex][i]);
        yield* iterate(currentIndex + 1);
        currentSelection.pop();
      }
  
      yield* iterate(currentIndex + 1); // Include empty selection for the current array
    }
  
    yield* iterate(0);
  }
  

const l=[
    [
      '6621b6162d2721658819a380_Day_1',
      '6621b6162d2721658819a380_Day_2',
      '6621b6162d2721658819a380_Day_3',
      '6621b6162d2721658819a380_Day_4',
      '6621b6162d2721658819a380_Day_5',
      '6621b6162d2721658819a380_Day_6'
    ],
    [
      '6621b6162d2721658819a384_Day_1',
      '6621b6162d2721658819a384_Day_2',
      '6621b6162d2721658819a384_Day_3'
    ],
    [
      '6621b6162d2721658819a388_Day_1',
      '6621b6162d2721658819a388_Day_2',
      '6621b6162d2721658819a388_Day_3',
      '6621b6162d2721658819a388_Day_4',
      '6621b6162d2721658819a388_Day_5'
    ],
    [
      '6621b6172d2721658819a38c_Day_1',
      '6621b6172d2721658819a38c_Day_2',
      '6621b6172d2721658819a38c_Day_3',
      '6621b6172d2721658819a38c_Day_4'
    ],
    [
      '6621b6172d2721658819a38f_Day_1',
      '6621b6172d2721658819a38f_Day_2',
      '6621b6172d2721658819a38f_Day_3',
      '6621b6172d2721658819a38f_Day_4',
      '6621b6172d2721658819a38f_Day_5',
      '6621b6172d2721658819a38f_Day_6'
    ],
    [
      '6621b6172d2721658819a393_Day_1',
      '6621b6172d2721658819a393_Day_2',
      '6621b6172d2721658819a393_Day_3',
      '6621b6172d2721658819a393_Day_4'
    ],
    [
      '6621b6182d2721658819a398_Day_1',
      '6621b6182d2721658819a398_Day_2'
    ],
    [
      '6621b6182d2721658819a39c_Day_1',
      '6621b6182d2721658819a39c_Day_2',
      '6621b6182d2721658819a39c_Day_3',
      '6621b6182d2721658819a39c_Day_4'
    ],
    [
      '6621b6182d2721658819a3a0_Day_1',
      '6621b6182d2721658819a3a0_Day_2',
      '6621b6182d2721658819a3a0_Day_3',
      '6621b6182d2721658819a3a0_Day_4',
      '6621b6182d2721658819a3a0_Day_5'
    ],
    [
      '6621b6192d2721658819a3a3_Day_1',
      '6621b6192d2721658819a3a3_Day_2',
      '6621b6192d2721658819a3a3_Day_3',
      '6621b6192d2721658819a3a3_Day_4'
    ],
    [
      '6621b6192d2721658819a3a6_Day_1',
      '6621b6192d2721658819a3a6_Day_2',
      '6621b6192d2721658819a3a6_Day_3'
    ],
    [
      '6621b6192d2721658819a3a9_Day_1',
      '6621b6192d2721658819a3a9_Day_2',
      '6621b6192d2721658819a3a9_Day_3',
      '6621b6192d2721658819a3a9_Day_4',
      '6621b6192d2721658819a3a9_Day_5',
      '6621b6192d2721658819a3a9_Day_6'
    ],
    [
      '6621b6192d2721658819a3ae_Day_1',
      '6621b6192d2721658819a3ae_Day_2',
      '6621b6192d2721658819a3ae_Day_3'
    ],
    [
      '6621b61a2d2721658819a3b3_Day_1',
      '6621b61a2d2721658819a3b3_Day_2',
      '6621b61a2d2721658819a3b3_Day_3',
      '6621b61a2d2721658819a3b3_Day_4',
      '6621b61a2d2721658819a3b3_Day_5'
    ],
    [
      '6621b61a2d2721658819a3b7_Day_1',
      '6621b61a2d2721658819a3b7_Day_2',
      '6621b61a2d2721658819a3b7_Day_3',
      '6621b61a2d2721658819a3b7_Day_4'
    ],
    [
      '6621b61a2d2721658819a3bc_Day_1',
      '6621b61a2d2721658819a3bc_Day_2',
      '6621b61a2d2721658819a3bc_Day_3',
      '6621b61a2d2721658819a3bc_Day_4'
    ],
    [
      '6621b61b2d2721658819a3c0_Day_1',
      '6621b61b2d2721658819a3c0_Day_2',
      '6621b61b2d2721658819a3c0_Day_3',
      '6621b61b2d2721658819a3c0_Day_4',
      '6621b61b2d2721658819a3c0_Day_5',
      '6621b61b2d2721658819a3c0_Day_6'
    ],
    [
      '6621b61b2d2721658819a3c5_Day_1',
      '6621b61b2d2721658819a3c5_Day_2',
      '6621b61b2d2721658819a3c5_Day_3',
      '6621b61b2d2721658819a3c5_Day_4',
      '6621b61b2d2721658819a3c5_Day_5'
    ],
    [
      '6621b61b2d2721658819a3c9_Day_1',
      '6621b61b2d2721658819a3c9_Day_2',
      '6621b61b2d2721658819a3c9_Day_3',
      '6621b61b2d2721658819a3c9_Day_4'
    ],
    [
      '6621b61c2d2721658819a3cc_Day_1',
      '6621b61c2d2721658819a3cc_Day_2'
    ],
    [
      '6621cd5e337b4950b3acfd11_Day_1',
      '6621cd5e337b4950b3acfd11_Day_2'
    ]
  ]
  
  // const arrays = [[1, 2], [3, 4], [5, 6]];
  
  

  async function saveCombinationsToFile(generator, filename) {
    try {
      const combinations = [];
  
      for await (const combination of generator) {
        await jsonfile.writeFile(filename, combination, { spaces: 2 }); // Write array of combinations to JSON file with indentation
      }
  
      console.log(`Combinations saved to JSON file: ${filename}`);
    } catch (error) {
      console.error(`Error saving combinations to file: ${error}`);
    }
  }
  
  const arrays = [[1, 2], [3, 4, 5]];
  const generator = getAllCombinationsGenerator(l);
  saveCombinationsToFile(generator, "combinations.json");
  
  