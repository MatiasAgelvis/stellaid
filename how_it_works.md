---
title: How it Works
layout: page
description: Stellaid helps you find the quality reviews and comfortably summarize them into a single value.
bodyClass: page-about
---
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

Stellaid helps you find the quality reviews and comfortably summarize them into a single value.

## Coursera


In Coursera, the browser extension constantly monitors you window to spot star ratings associated with courses, projects, specializations, or professional certificates, the extension inspects the review pages of each one, where it extracts the stars given in the review as well as the date and the number of people that have found that review useful, if you are a new like me i’ll put the equations below

$$ \alpha = \sum_{i=0}^{24} \frac{(\#\ stars\ given\ in\ review\ i)\cdot(\#\ likes\ of\ review\ i)^2}{(age\ of\ review\ i)^3} $$

$$ \beta = \sum_{i=0}^{24} \frac{(\#\ likes\ of\ review\ i)^2}{(age\ of\ review\ i)^3} $$

$$ \gamma = \frac{\alpha}{\beta} $$


Basically it's a weighted average in function of the review age and peer support, In the case of courses and projects that value is the final result, for specializations and professional certificates this process is applied to each of its constituent courses and averaged.

Finally the resulting value is then printed to the right of the original value for you to consider.