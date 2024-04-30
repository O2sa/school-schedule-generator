import itertools

# Recursive approach
def generate_combinations_recursive(arrays, index=0, current=[]):
    if index == len(arrays):
        yield tuple(current)
        return
    
    for item in arrays[index]:
        yield from generate_combinations_recursive(arrays, index + 1, current + [item])

# Using itertools.product for nested loops
def generate_combinations_nested(arrays):
    return itertools.product(*arrays)

# Example arrays
array1 = [1, 2, 3]
array2 = ['a', 'b', 'c']
array3 = ['x', 'y']
kj=[
  [
    { '6621b6162d2721658819a380_Day_1' },
    { '6621b6162d2721658819a380_Day_2' },
    { '6621b6162d2721658819a380_Day_3' },
    { '6621b6162d2721658819a380_Day_4' },
    { '6621b6162d2721658819a380_Day_5' },
    { '6621b6162d2721658819a380_Day_6' }
  ],
  [
    { '6621b6162d2721658819a384_Day_1' },
    { '6621b6162d2721658819a384_Day_2' },
    { '6621b6162d2721658819a384_Day_3' }
  ],
  [
    { '6621b6162d2721658819a388_Day_1' },
    { '6621b6162d2721658819a388_Day_2' },
    { '6621b6162d2721658819a388_Day_3' },
    { '6621b6162d2721658819a388_Day_4' },
    { '6621b6162d2721658819a388_Day_5' }
  ],
  [
    { '6621b6172d2721658819a38c_Day_1' },
    { '6621b6172d2721658819a38c_Day_2' },
    { '6621b6172d2721658819a38c_Day_3' },
    { '6621b6172d2721658819a38c_Day_4' }
  ],
  [
    { '6621b6172d2721658819a38f_Day_1' },
    { '6621b6172d2721658819a38f_Day_2' },
    { '6621b6172d2721658819a38f_Day_3' },
    { '6621b6172d2721658819a38f_Day_4' },
    { '6621b6172d2721658819a38f_Day_5' },
    { '6621b6172d2721658819a38f_Day_6' }
  ],
  [
    { '6621b6172d2721658819a393_Day_1' },
    { '6621b6172d2721658819a393_Day_2' },
    { '6621b6172d2721658819a393_Day_3' },
    { '6621b6172d2721658819a393_Day_4' }
  ],
  [
    { '6621b6182d2721658819a398_Day_1' },
    { '6621b6182d2721658819a398_Day_2' }
  ],
  [
    { '6621b6182d2721658819a39c_Day_1' },
    { '6621b6182d2721658819a39c_Day_2' },
    { '6621b6182d2721658819a39c_Day_3' },
    { '6621b6182d2721658819a39c_Day_4' }
  ],
  [
    { '6621b6182d2721658819a3a0_Day_1' },
    { '6621b6182d2721658819a3a0_Day_2' },
    { '6621b6182d2721658819a3a0_Day_3' },
    { '6621b6182d2721658819a3a0_Day_4' },
    { '6621b6182d2721658819a3a0_Day_5' }
  ],
  [
    { '6621b6192d2721658819a3a3_Day_1' },
    { '6621b6192d2721658819a3a3_Day_2' },
    { '6621b6192d2721658819a3a3_Day_3' },
    { '6621b6192d2721658819a3a3_Day_4' }
  ],
  [
    { '6621b6192d2721658819a3a6_Day_1' },
    { '6621b6192d2721658819a3a6_Day_2' },
    { '6621b6192d2721658819a3a6_Day_3' }
  ],
  [
    { '6621b6192d2721658819a3a9_Day_1' },
    { '6621b6192d2721658819a3a9_Day_2' },
    { '6621b6192d2721658819a3a9_Day_3' },
    { '6621b6192d2721658819a3a9_Day_4' },
    { '6621b6192d2721658819a3a9_Day_5' },
    { '6621b6192d2721658819a3a9_Day_6' }
  ],
  [
    { '6621b6192d2721658819a3ae_Day_1' },
    { '6621b6192d2721658819a3ae_Day_2' },
    { '6621b6192d2721658819a3ae_Day_3' }
  ],
  [
    { '6621b61a2d2721658819a3b3_Day_1' },
    { '6621b61a2d2721658819a3b3_Day_2' },
    { '6621b61a2d2721658819a3b3_Day_3' },
    { '6621b61a2d2721658819a3b3_Day_4' },
    { '6621b61a2d2721658819a3b3_Day_5' }
  ],
  [
    { '6621b61a2d2721658819a3b7_Day_1' },
    { '6621b61a2d2721658819a3b7_Day_2' },
    { '6621b61a2d2721658819a3b7_Day_3' },
    { '6621b61a2d2721658819a3b7_Day_4' }
  ],
  [
    { '6621b61a2d2721658819a3bc_Day_1' },
    { '6621b61a2d2721658819a3bc_Day_2' },
    { '6621b61a2d2721658819a3bc_Day_3' },
    { '6621b61a2d2721658819a3bc_Day_4' }
  ],
  [
    { '6621b61b2d2721658819a3c0_Day_1' },
    { '6621b61b2d2721658819a3c0_Day_2' },
    { '6621b61b2d2721658819a3c0_Day_3' },
    { '6621b61b2d2721658819a3c0_Day_4' },
    { '6621b61b2d2721658819a3c0_Day_5' },
    { '6621b61b2d2721658819a3c0_Day_6' }
  ],
  [
    { '6621b61b2d2721658819a3c5_Day_1' },
    { '6621b61b2d2721658819a3c5_Day_2' },
    { '6621b61b2d2721658819a3c5_Day_3' },
    { '6621b61b2d2721658819a3c5_Day_4' },
    { '6621b61b2d2721658819a3c5_Day_5' }
  ],
  [
    { '6621b61b2d2721658819a3c9_Day_1' },
    { '6621b61b2d2721658819a3c9_Day_2' },
    { '6621b61b2d2721658819a3c9_Day_3' },
    { '6621b61b2d2721658819a3c9_Day_4' }
  ],
  [
    { '6621b61c2d2721658819a3cc_Day_1' },
    { '6621b61c2d2721658819a3cc_Day_2' }
  ],
  [
    { '6621cd5e337b4950b3acfd11_Day_1' },
    { '6621cd5e337b4950b3acfd11_Day_2' }
  ]
]
# Recursive approach
combinations_recursive = list(generate_combinations_recursive(kj))

# Nested loops approach
combinations_nested = list(generate_combinations_nested([array1, array2, array3]))

print("Combinations (Recursive):", combinations_recursive)
print("Combinations (Nested Loops):", combinations_nested)
