# Git Object Visualizer

_Experimental_ Node.js application that creates a DOT representation of a git repository.

DOT files can be used to create graphs with [Graphviz](https://www.graphviz.org/).

## Example usage:

_Some image viewers you can easily open the results with: nomacs, feh, inkview (for svg, part of inkscape)_

With intermediate files:

```
node index.js /path/to/some/repo/.git > repo.gv
dot -Tsvg repo.gv -o repo.svg
inkview repo.svg &
```
```
node index.js /path/to/some/repo/.git > repo.gv
dot -Tpng repo.gv -o repo.png
feh repo.png &
```

Example PNG:

![example generated png](https://raw.githubusercontent.com/gorhawk/git-object-visualizer/master/doc/example.png)