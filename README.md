# Git Object Visualizer

Node.js application that creates a DOT representation of a git repository.

DOT files can be used to create graphs with [Graphviz](https://www.graphviz.org/).

## Example usage:

With intermediate files:
```
node index.js /path/to/some/repo/.git > repo.gv
dot -Tsvg repo.gv -o repo.svg
inkview repo.svg &
```

