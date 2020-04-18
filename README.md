# Git Object Visualizer

_Experimental_ Node.js application that creates a DOT representation of a git repository.

DOT files can be used to create graphs with [Graphviz](https://www.graphviz.org/).

## Example usage:

With intermediate files:

```
node index.js /path/to/some/repo/.git > repo.gv
dot -Tsvg repo.gv -o repo.svg
inkview repo.svg &
```

Example PNG:

![example generated png](https://raw.githubusercontent.com/gorhawk/git-object-visualizer/master/example.png)